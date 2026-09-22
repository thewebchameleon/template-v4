using TemplateV4.Application.Cms;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class CmsEndpoints
{
    public static RouteGroupBuilder MapCmsEndpoints(this RouteGroupBuilder group)
    {
        group.MapContentEndpoints();
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
        cms.MapGet("/sections", async (ICmsSections store, CancellationToken ct) => (await store.Read(ct)).ToHttp()).WithName("GetCmsSections").Produces<CmsSections>();
        cms.MapPost("/sections", async (SaveCmsSections request, ICmsSections store, CancellationToken ct) => (await store.Save(request, ct)).ToHttp()).WithName("SaveCmsSections").Produces<CmsSections>();
        cms.MapPost("/sections/publish", async (PublishCmsSections request, ICmsSections store, CancellationToken ct) => (await store.Publish(request, ct)).ToHttp()).WithName("PublishCmsSections").Produces<CmsSections>();
        return group;
    }
}
