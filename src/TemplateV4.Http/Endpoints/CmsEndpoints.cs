using TemplateV4.Application.Cms;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class CmsEndpoints
{
    public static RouteGroupBuilder MapCmsEndpoints(this RouteGroupBuilder group)
    {
        var cms = group.MapGroup("/cms").RequireAuthorization(Permissions.CmsEdit).OwnedByModule(ModuleIds.Cms).RequireCapability(CapabilityIds.Cms);
        cms.AddEndpointFilter(async (context, next) =>
        {
            context.HttpContext.Response.Headers.CacheControl = "no-store";
            context.HttpContext.Response.Headers["X-Robots-Tag"] = "noindex, nofollow";
            return await next(context);
        });
        cms.MapGet("", async (ICms store, CancellationToken ct, string search = "", string status = "all", int pageNumber = 1, int pageSize = 10, string sort = "updatedAt", string direction = "desc") =>
            (await store.List(new(search, status, pageNumber, pageSize, sort, direction), ct)).ToHttp()).WithName("ListCmsArticles").Produces<Page<CmsArticleSummary>>();
        cms.MapGet("/{id:guid}", async (Guid id, ICms store, CancellationToken ct) => (await store.Detail(id, ct)).ToHttp()).WithName("GetCmsArticle").Produces<CmsArticle>();
        cms.MapPost("", async (SaveArticle request, ICms store, CancellationToken ct) => (await store.Save(request, ct)).ToHttp()).WithName("SaveCmsArticle").Produces<CmsArticle>();
        cms.MapPost("/{id:guid}/publish", async (Guid id, PublishArticle request, ICms store, CancellationToken ct) => (await store.Publish(id, request, ct)).ToHttp()).WithName("PublishCmsArticle").Produces<CmsArticle>();
        cms.MapPost("/preview", async (PreviewMarkdown request, ICms store, CancellationToken ct) => (await store.Preview(request, ct)).ToHttp()).WithName("PreviewCmsMarkdown").Produces<MarkdownPreview>();
        return group;
    }
    public static void MapPublicBlog(this WebApplication app)
    {
        var blog = app.MapGroup("/blog").AllowAnonymous().RequireRateLimiting("api").OwnedByModule(ModuleIds.Cms).RequireCapability(CapabilityIds.Cms);
        blog.AddEndpointFilter(async (context, next) =>
        {
            context.HttpContext.Response.Headers.CacheControl = "no-store";
            context.HttpContext.Response.Headers.ContentSecurityPolicy = "default-src 'none'; style-src 'self'; font-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";
            return await next(context);
        });
        blog.MapGet("", BlogPages.Index).ExcludeFromDescription();
        blog.MapGet("/{slug}", BlogPages.Article).ExcludeFromDescription();
    }
}
