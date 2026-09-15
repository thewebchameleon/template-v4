using System.Globalization;
using System.Net;
using System.Text;
using TemplateV4.Application.Cms;

namespace TemplateV4.ApiService.Endpoints;

internal static class BlogPages
{
    private static string E(string value) => WebUtility.HtmlEncode(value);
    private static string Text(string en, string af) => CultureInfo.CurrentUICulture.Name == "af-ZA" ? af : en;
    private static string Url(IConfiguration config, string path) => (config["Web:PublicUrl"] ?? throw new InvalidOperationException("Web:PublicUrl is required.")).TrimEnd('/') + path;
    internal static async Task<IResult> Index(ICms cms, IConfiguration config, CancellationToken ct, int page = 1)
    {
        var result = await cms.Blog(page, 10, ct);
        if (!result.IsSuccess) return ApiResults.Failure(result.Error!);
        var data = result.Value!;
        if (page > 1 && (page - 1) * 10 >= data.Total) return Results.NotFound();
        var title = Text("Blog & news", "Blog en nuus");
        var description = Text("The latest articles and news.", "Die jongste artikels en nuus.");
        var body = new StringBuilder($"<h1>{E(title)}</h1><p class=\"intro\">{E(description)}</p>");
        if (data.Total == 0) body.Append($"<p>{Text("No articles published yet.", "Geen artikels is nog gepubliseer nie.")}</p>");
        foreach (var article in data.Items)
            body.Append($"<article class=\"summary\"><p class=\"byline\">{E(article.Author)} · {Date(article.PublishedAt)}</p><h2><a href=\"/blog/{E(article.Slug)}\">{E(article.Title)}</a></h2><p>{E(article.Excerpt)}</p></article>");
        body.Append($"<nav aria-label=\"{Text("Pagination", "Bladsye")}\">");
        if (page > 1) body.Append($"<a rel=\"prev\" href=\"/blog?page={page - 1}\">{Text("Newer articles", "Nuwer artikels")}</a>");
        if (page * 10 < data.Total) body.Append($"<a rel=\"next\" href=\"/blog?page={page + 1}\">{Text("Older articles", "Ouer artikels")}</a>");
        body.Append("</nav>");
        return Page(title, description, Url(config, page == 1 ? "/blog" : $"/blog?page={page}"), body.ToString());
    }
    internal static async Task<IResult> Article(string slug, ICms cms, IConfiguration config, CancellationToken ct)
    {
        var result = await cms.Article(slug, ct);
        if (!result.IsSuccess) return ApiResults.Failure(result.Error!);
        var content = result.Value!; var article = content.Article;
        var body = $"<article><header><p class=\"byline\">{E(article.Author)} · {Date(article.PublishedAt)}</p><h1>{E(article.Title)}</h1><p class=\"intro\">{E(article.Excerpt)}</p></header><div class=\"cms-prose\">{content.Html}</div><footer>{Text("Updated", "Bygewerk")}: {Date(article.UpdatedAt)}</footer></article>";
        return Page(article.Title, article.Excerpt, Url(config, "/blog/" + article.Slug), body,
            $"<meta property=\"article:published_time\" content=\"{article.PublishedAt:O}\"><meta property=\"article:modified_time\" content=\"{article.UpdatedAt:O}\"><meta property=\"article:author\" content=\"{E(article.Author)}\">");
    }
    private static string Date(DateTimeOffset value) => $"<time datetime=\"{value:O}\">{E(value.ToString("d MMMM yyyy", CultureInfo.CurrentUICulture))}</time>";
    private static IResult Page(string title, string description, string url, string body, string metadata = "") => Results.Content($"""
        <!doctype html><html lang="{E(CultureInfo.CurrentUICulture.Name)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
        <title>{E(title)}</title><meta name="description" content="{E(description)}"><link rel="canonical" href="{E(url)}">
        <meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(description)}"><meta property="og:url" content="{E(url)}"><meta property="og:type" content="{(metadata.Length > 0 ? "article" : "website")}">
        <meta name="twitter:card" content="summary"><meta name="twitter:title" content="{E(title)}"><meta name="twitter:description" content="{E(description)}">{metadata}<link rel="stylesheet" href="/cms.css"></head>
        <body><a class="skip" href="#content">{Text("Skip to content", "Spring na inhoud")}</a><header class="site-header"><a href="/blog">{Text("Blog & news", "Blog en nuus")}</a><a href="/">{Text("Home", "Tuis")}</a></header><main id="content">{body}</main></body></html>
        """, "text/html; charset=utf-8");
}
