using TemplateV4.Application.Users;

namespace TemplateV4.Application.Cms;

public sealed record ArticleContent(string Title, string Slug, string Excerpt, string Markdown, string Author);
public sealed record CmsArticle(Guid Id, Guid Version, ArticleContent Draft, bool Published, bool PendingChanges,
    DateTimeOffset UpdatedAt, DateTimeOffset? PublishedAt);
public sealed record CmsArticleSummary(Guid Id, string Title, bool Published, bool PendingChanges, DateTimeOffset UpdatedAt);
public sealed record BlogSummary(string Title, string Slug, string Excerpt, string Author, DateTimeOffset PublishedAt, DateTimeOffset UpdatedAt);
public sealed record BlogArticle(BlogSummary Article, string Html);
public sealed record SaveArticle(Guid? Id, Guid? Version, ArticleContent Content);
public sealed record PublishArticle(Guid Version, bool Published);
public sealed record PreviewMarkdown(string Markdown);
public sealed record MarkdownPreview(string Html);
public sealed record CmsList(string Search = "", string Status = "all", int PageNumber = 1, int PageSize = 10, string Sort = "updatedAt", string Direction = "desc");
public interface ICms
{
    Task<Result<Page<CmsArticleSummary>>> List(CmsList query, CancellationToken ct);
    Task<Result<CmsArticle>> Detail(Guid id, CancellationToken ct);
    Task<Result<CmsArticle>> Save(SaveArticle request, CancellationToken ct);
    Task<Result<CmsArticle>> Publish(Guid id, PublishArticle request, CancellationToken ct);
    Task<Result<MarkdownPreview>> Preview(PreviewMarkdown request, CancellationToken ct);
    Task<Result<Page<BlogSummary>>> Blog(int pageNumber, int pageSize, CancellationToken ct);
    Task<Result<BlogArticle>> Article(string slug, CancellationToken ct);
}
