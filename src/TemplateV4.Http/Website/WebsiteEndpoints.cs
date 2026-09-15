using TemplateV4.Application.Cms;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Application.Website;

namespace TemplateV4.ApiService.Endpoints;

public static class WebsiteEndpoints
{
    public static RouteGroupBuilder MapWebsiteAdministration(this RouteGroupBuilder group)
    {
        var site = group.MapGroup("/website").RequireAuthorization(Permissions.Settings).RequireAuthorization(policy => policy.RequireRole("Administrator"));
        site.MapGet("", async (IWebsite store, CancellationToken ct) => Results.Ok(await store.Settings(ct)))
            .WithName("GetWebsiteSettings").Produces<WebsiteSettings>();
        site.MapPost("", async (SaveWebsite request, IWebsite store, CancellationToken ct) => (await store.Save(request, ct)).ToHttp())
            .WithName("SaveWebsiteSettings").Produces<WebsiteSettings>();
        site.MapPost("/enabled", async (SetWebsiteEnabled request, IWebsite store, CancellationToken ct) => (await store.Enable(request, ct)).ToHttp())
            .WithName("SetWebsiteEnabled").Produces<WebsiteSettings>();
        group.MapPost("/website-images", async (HttpRequest request, IWebsite store, CancellationToken ct) =>
        {
            using var buffer = new MemoryStream();
            var bytes = new byte[8192]; int count;
            while ((count = await request.Body.ReadAsync(bytes, ct)) > 0)
            {
                if (buffer.Length + count > 1048576) return Results.StatusCode(413);
                await buffer.WriteAsync(bytes.AsMemory(0, count), ct);
            }
            return (await store.Upload(buffer.ToArray(), ct)).ToHttp();
        }).RequireAuthorization(policy => policy.RequireAssertion(c => c.User.IsInRole("Administrator") || c.User.HasClaim("permission", Permissions.CmsEdit)))
            .WithName("UploadWebsiteImage").Produces<WebsiteImage>();

        return group;
    }
    public static void MapPublicWebsite(this WebApplication app)
    {
        var site = app.MapGroup("/api/v1/website").WithTags("Framework").AllowAnonymous().RequireRateLimiting("website");
        site.AddEndpointFilter(async (context, next) => { context.HttpContext.Response.Headers.CacheControl = "no-store"; return await next(context); });
        site.MapGet("", async (IWebsite store, CancellationToken ct) => Results.Ok(await store.Public(ct))).WithName("GetPublicWebsite").Produces<PublicWebsite>();
        site.MapGet("/images/{id:guid}", async (Guid id, IWebsite store, HttpResponse response, CancellationToken ct) =>
        {
            response.Headers["X-Content-Type-Options"] = "nosniff";
            return await store.Image(id, ct) is { } image ? Results.Stream(image.Content, image.ContentType) : Results.NotFound();
        }).WithName("GetWebsiteImage");
        site.MapPublicContact();
        var cms = site.MapGroup("/cms").OwnedByModule(ModuleIds.Cms).RequireCapability(CapabilityIds.Cms);
        cms.MapGet("/sections", async (ICmsSections store, IWebsite website, CancellationToken ct) => (await website.Public(ct)).Enabled ? (await store.Public(ct)).ToHttp() : Results.NotFound()).WithName("GetPublicCmsSections").Produces<LandingSection[]>();
        cms.MapGet("/blog", async (ICms store, IWebsite website, CancellationToken ct, int pageNumber = 1) => (await website.Public(ct)).Enabled ? (await store.Blog(pageNumber, 10, ct)).ToHttp() : Results.NotFound()).WithName("GetPublicBlog").Produces<Page<BlogSummary>>();
        cms.MapGet("/blog/{slug}", async (string slug, ICms store, IWebsite website, CancellationToken ct) => (await website.Public(ct)).Enabled ? (await store.Article(slug, ct)).ToHttp() : Results.NotFound()).WithName("GetPublicBlogArticle").Produces<BlogArticle>();
    }
}
