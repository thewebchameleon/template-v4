using TemplateV4.Application.Users;

namespace TemplateV4.Application.Cms;

public interface ICms
{
    Task<Result<Page<CmsArticleSummary>>> List(CmsList query, CancellationToken ct);
    Task<Result<CmsArticle>> Detail(Guid id, CancellationToken ct);
    Task<Result<CmsArticle>> Save(SaveArticle request, CancellationToken ct);
    Task<Result<CmsArticle>> Publish(Guid id, PublishArticle request, CancellationToken ct);
    Task<Result<Page<BlogSummary>>> Blog(int pageNumber, int pageSize, CancellationToken ct);
    Task<Result<BlogArticle>> Article(string slug, CancellationToken ct);
}
