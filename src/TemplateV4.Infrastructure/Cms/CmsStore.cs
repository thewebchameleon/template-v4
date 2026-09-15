using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TemplateV4.Application;
using TemplateV4.Application.Cms;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;
using IExecutionContext = TemplateV4.SharedKernel.IExecutionContext;

namespace TemplateV4.Infrastructure.Cms;

public sealed partial class CmsStore(FrameworkDb db, IExecutionContext context, ICapabilities capabilities, TimeProvider time) : ICms
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private IQueryable<ArticleRow> Rows => db.Set<ArticleRow>();
    private static ArticleContent Content(string value) => JsonSerializer.Deserialize<ArticleContent>(value, Json)!;
    private static CmsArticle Read(ArticleRow row) => new(row.Id, row.Version, Content(row.Draft), row.Published,
        row.Published && row.Draft != row.PublishedContent, row.UpdatedAt, row.PublishedAt);
    private static BlogSummary Summary(ArticleRow row)
    {
        var content = Content(row.PublishedContent!);
        return new(content.Title, row.Slug, content.Excerpt, content.Author, row.PublishedAt!.Value, row.PublishedUpdatedAt!.Value);
    }
    private async Task<AppError?> Access(bool editor, CancellationToken ct)
    {
        if (!await capabilities.Enabled(CapabilityIds.Cms, ct)) return new("resource.not_found", ErrorKind.NotFound);
        if (editor && (context.ActorId is null || !context.Permissions.Contains(Permissions.CmsEdit))) return new("access.forbidden", ErrorKind.Forbidden);
        return null;
    }
    private static Result<T> Fail<T>(AppError error) => Result<T>.Fail(error.Code, error.Kind);
    [GeneratedRegex("^[a-z0-9]+(?:-[a-z0-9]+)*$")]
    private static partial Regex SlugPattern();
    public async Task<Result<Page<CmsArticleSummary>>> List(CmsList query, CancellationToken ct)
    {
        if (await Access(true, ct) is { } error) return Fail<Page<CmsArticleSummary>>(error);
        if (query.Search is null or { Length: > 200 } || query.Status is not ("all" or "draft" or "published") ||
            query.PageNumber is < 1 or > 10000 || query.PageSize is not (5 or 10 or 25 or 50) ||
            query.Sort is not ("title" or "published" or "updatedAt") || query.Direction is not ("asc" or "desc"))
            return Result<Page<CmsArticleSummary>>.Fail("validation.failed", ErrorKind.Validation);
        var rows = Rows.AsNoTracking();
        if (query.Status != "all") rows = rows.Where(x => x.Published == (query.Status == "published"));
        var search = query.Search.Trim().ToLowerInvariant();
        if (search.Length > 0) rows = rows.Where(x => x.Title.ToLower().Contains(search));
        var total = await rows.CountAsync(ct);
        var asc = query.Direction == "asc";
        var sorted = query.Sort switch
        {
            "title" => asc ? rows.OrderBy(x => x.Title) : rows.OrderByDescending(x => x.Title),
            "published" => asc ? rows.OrderBy(x => x.Published) : rows.OrderByDescending(x => x.Published),
            _ => asc ? rows.OrderBy(x => x.UpdatedAt) : rows.OrderByDescending(x => x.UpdatedAt)
        };
        var page = await sorted.ThenBy(x => x.Id).Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize)
            .Select(x => new CmsArticleSummary(x.Id, x.Title, x.Published, x.Published && x.Draft != x.PublishedContent, x.UpdatedAt)).ToArrayAsync(ct);
        return Result<Page<CmsArticleSummary>>.Success(new(page, total, query.PageNumber, query.PageSize));
    }
    public async Task<Result<CmsArticle>> Detail(Guid id, CancellationToken ct)
    {
        if (await Access(true, ct) is { } error) return Fail<CmsArticle>(error);
        var row = await Rows.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        return row is null ? Result<CmsArticle>.Fail("resource.not_found", ErrorKind.NotFound) : Result<CmsArticle>.Success(Read(row));
    }
    public async Task<Result<CmsArticle>> Save(SaveArticle request, CancellationToken ct)
    {
        if (await Access(true, ct) is { } error) return Fail<CmsArticle>(error);
        var data = request.Content;
        if (data is null || string.IsNullOrWhiteSpace(data.Title) || data.Title.Length > 200 ||
            string.IsNullOrWhiteSpace(data.Slug) || data.Slug.Length > 160 || !SlugPattern().IsMatch(data.Slug) ||
            string.IsNullOrWhiteSpace(data.Excerpt) || data.Excerpt.Length > 500 ||
            string.IsNullOrWhiteSpace(data.Author) || data.Author.Length > 120 ||
            string.IsNullOrWhiteSpace(data.Markdown) || data.Markdown.Length > 100000 ||
            request.Id == Guid.Empty || request.Id.HasValue != request.Version.HasValue)
            return Result<CmsArticle>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var row = request.Id.HasValue ? await Rows.SingleOrDefaultAsync(x => x.Id == request.Id, ct) : new ArticleRow();
        if (row is null) return Result<CmsArticle>.Fail("resource.not_found", ErrorKind.NotFound);
        if (request.Id.HasValue && row.Version != request.Version) return Result<CmsArticle>.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (row.PublishedAt.HasValue && row.Slug != data.Slug) return Result<CmsArticle>.Fail("cms.slug_locked", ErrorKind.Validation);
        row.Title = data.Title.Trim(); row.Slug = data.Slug;
        row.Draft = JsonSerializer.Serialize(data with { Title = row.Title, Excerpt = data.Excerpt.Trim(), Author = data.Author.Trim() }, Json);
        if (!request.Id.HasValue) db.Set<ArticleRow>().Add(row);
        return await Commit(row, request.Id.HasValue ? "cms.saved" : "cms.created", tx, ct);
    }
    public async Task<Result<CmsArticle>> Publish(Guid id, PublishArticle request, CancellationToken ct)
    {
        if (await Access(true, ct) is { } error) return Fail<CmsArticle>(error);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var row = await Rows.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return Result<CmsArticle>.Fail("resource.not_found", ErrorKind.NotFound);
        if (row.Version != request.Version) return Result<CmsArticle>.Fail("concurrency.conflict", ErrorKind.Conflict);
        row.Published = request.Published;
        if (request.Published)
        {
            row.PublishedContent = row.Draft;
            row.PublishedAt ??= time.GetUtcNow();
            row.PublishedUpdatedAt = time.GetUtcNow();
        }
        return await Commit(row, request.Published ? "cms.published" : "cms.unpublished", tx, ct);
    }
    private async Task<Result<CmsArticle>> Commit(ArticleRow row, string action, Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction tx, CancellationToken ct)
    {
        row.Version = Guid.NewGuid(); row.UpdatedAt = time.GetUtcNow();
        db.Audit.Add(new() { ActorId = context.ActorId, SubjectId = row.Id, SubjectType = "cms.article", Action = action, At = row.UpdatedAt });
        try { await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); }
        catch (DbUpdateConcurrencyException)
        {
            await tx.RollbackAsync(ct); db.ChangeTracker.Clear();
            return Result<CmsArticle>.Fail("concurrency.conflict", ErrorKind.Conflict);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            await tx.RollbackAsync(ct); db.ChangeTracker.Clear();
            return Result<CmsArticle>.Fail("cms.slug_taken", ErrorKind.Conflict);
        }
        return Result<CmsArticle>.Success(Read(row));
    }
    public async Task<Result<MarkdownPreview>> Preview(PreviewMarkdown request, CancellationToken ct)
    {
        if (await Access(true, ct) is { } error) return Fail<MarkdownPreview>(error);
        return request.Markdown is null or { Length: > 100000 }
            ? Result<MarkdownPreview>.Fail("validation.failed", ErrorKind.Validation)
            : Result<MarkdownPreview>.Success(new(CmsMarkdown.Render(request.Markdown)));
    }
    public async Task<Result<Page<BlogSummary>>> Blog(int pageNumber, int pageSize, CancellationToken ct)
    {
        if (await Access(false, ct) is { } error) return Fail<Page<BlogSummary>>(error);
        if (pageNumber is < 1 or > 10000 || pageSize is not (5 or 10 or 25 or 50)) return Result<Page<BlogSummary>>.Fail("validation.failed", ErrorKind.Validation);
        var rows = Rows.AsNoTracking().Where(x => x.Published);
        var count = await rows.CountAsync(ct);
        var items = await rows.OrderByDescending(x => x.PublishedAt).ThenBy(x => x.Id).Skip((pageNumber - 1) * pageSize).Take(pageSize)
            .Select(x => new ArticleRow { Slug = x.Slug, PublishedContent = x.PublishedContent, PublishedAt = x.PublishedAt, PublishedUpdatedAt = x.PublishedUpdatedAt }).ToArrayAsync(ct);
        return Result<Page<BlogSummary>>.Success(new(items.Select(Summary).ToArray(), count, pageNumber, pageSize));
    }
    public async Task<Result<BlogArticle>> Article(string slug, CancellationToken ct)
    {
        if (await Access(false, ct) is { } error) return Fail<BlogArticle>(error);
        var row = await Rows.AsNoTracking().Where(x => x.Published && x.Slug == slug)
            .Select(x => new ArticleRow { Slug = x.Slug, PublishedContent = x.PublishedContent, PublishedAt = x.PublishedAt, PublishedUpdatedAt = x.PublishedUpdatedAt }).SingleOrDefaultAsync(ct);
        return row is null ? Result<BlogArticle>.Fail("resource.not_found", ErrorKind.NotFound)
            : Result<BlogArticle>.Success(new(Summary(row), CmsMarkdown.Render(Content(row.PublishedContent!).Markdown)));
    }
}

