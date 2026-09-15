namespace TemplateV4.Application.Cms;

public sealed record BlogSummary(string Title, string Slug, string Excerpt, string Author, DateTimeOffset PublishedAt, DateTimeOffset UpdatedAt);
public sealed record BlogArticle(BlogSummary Article, string Html);
