using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TemplateV4.Application.Cms;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;
using IExecutionContext = TemplateV4.SharedKernel.IExecutionContext;

namespace TemplateV4.Infrastructure.Cms;

public sealed partial class CmsStore(CmsDb db, IExecutionContext context, ICapabilities capabilities, TimeProvider time, IContentCms contentCms) : ICms
{
    public CmsStore(CmsDb db, IExecutionContext context, ICapabilities capabilities, TimeProvider time)
        : this(db, context, capabilities, time, new ContentStore(db, context, capabilities, new ActionItemsService(db, time), time,
            new Security.AccessManagementService(db, context, time, [new CmsRoleDelegation(db)]), new Storage.FileReferences(db, time))) { }
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
}
