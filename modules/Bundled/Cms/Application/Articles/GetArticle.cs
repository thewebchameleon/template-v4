namespace TemplateV4.Application.Cms;

public sealed record CmsArticle(Guid Id, Guid Version, ArticleContent Draft, bool Published, bool PendingChanges,
    DateTimeOffset UpdatedAt, DateTimeOffset? PublishedAt);
