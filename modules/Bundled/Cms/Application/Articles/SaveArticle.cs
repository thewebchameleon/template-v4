namespace TemplateV4.Application.Cms;

public sealed record ArticleContent(string Title, string Slug, string Excerpt, string Markdown, string Author);
public sealed record SaveArticle(Guid? Id, Guid? Version, ArticleContent Content);
