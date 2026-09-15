using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Cms;
using TemplateV4.Application.Users;

namespace TemplateV4.Infrastructure.Cms;

public sealed partial class CmsStore
{
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
}
