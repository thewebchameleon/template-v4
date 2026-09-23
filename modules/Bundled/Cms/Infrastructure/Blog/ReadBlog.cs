using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Cms;
using TemplateV4.Application.Users;

namespace TemplateV4.Infrastructure.Cms;

public sealed partial class CmsStore
{
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
