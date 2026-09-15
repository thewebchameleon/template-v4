using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Cms;

namespace TemplateV4.Infrastructure.Cms;

public sealed partial class CmsStore
{
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
}
