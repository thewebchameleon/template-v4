using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Cms;

namespace TemplateV4.Infrastructure.Cms;

public sealed partial class CmsStore
{
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
}
