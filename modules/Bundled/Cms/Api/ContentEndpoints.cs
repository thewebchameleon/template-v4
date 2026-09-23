using System.Security.Claims;
using TemplateV4.Application.ApiKeys;
using TemplateV4.Application.Cms;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class ContentEndpoints
{
    public static void MapContentEndpoints(this RouteGroupBuilder group)
    {
        var cms = group.MapGroup("/cms/collections").RequireAuthorization().OwnedByModule(ModuleIds.Cms).RequireCapability(CapabilityIds.Cms);
        cms.AddEndpointFilter(async (context, next) => { context.HttpContext.Response.Headers.CacheControl = "no-store"; return await next(context); });
        cms.MapGet("", async (IContentCms store, CancellationToken ct) => (await store.Collections(ct)).ToHttp()).WithName("ListContentCollections").Produces<ContentCollection[]>();
        cms.MapGet("/access-options", async (IContentCms store, CancellationToken ct) => (await store.AccessOptions(ct)).ToHttp()).WithName("GetContentAccessOptions").Produces<ContentAccessOptions>();
        cms.MapGet("/{key}", async (string key, IContentCms store, CancellationToken ct) => (await store.Collection(key, ct)).ToHttp()).WithName("GetContentCollection").Produces<ContentCollection>();
        cms.MapPost("", async (SaveCollection request, IContentCms store, CancellationToken ct) => (await store.SaveCollection(request, ct)).ToHttp()).WithName("SaveContentCollection").Produces<ContentCollection>();
        cms.MapPost("/{key}/grants", async (string key, SaveContentGrants request, IContentCms store, CancellationToken ct) => (await store.SaveGrants(key, request, ct)).ToHttp()).WithName("SaveContentGrants").Produces<ContentCollection>();
        cms.MapGet("/{key}/items", async (string key, [AsParameters] ContentQuery query, IContentCms store, CancellationToken ct) => (await store.Items(key, query, ct)).ToHttp()).WithName("ListContentItems").Produces<Page<ContentItemSummary>>();
        cms.MapGet("/{key}/items/{id:guid}", async (string key, Guid id, IContentCms store, CancellationToken ct) => (await store.Item(key, id, ct)).ToHttp()).WithName("GetContentItem").Produces<ContentItem>();
        cms.MapPost("/{key}/items", async (string key, SaveContentItem request, IContentCms store, CancellationToken ct) => (await store.Save(key, request, ct)).ToHttp()).WithName("SaveContentItem").Produces<ContentItem>();
        cms.MapPost("/{key}/items/{id:guid}/transition", async (string key, Guid id, ContentTransition request, IContentCms store, CancellationToken ct) => (await store.Transition(key, id, request, ct)).ToHttp()).WithName("TransitionContentItem").Produces<ContentItem>();
    }
    public static void MapPublishedContentEndpoints(this WebApplication app)
    {
        var external = app.MapGroup("/api/external/cms/collections").OwnedByModule(ModuleIds.Cms).RequireCapability(CapabilityIds.Cms).RequireAuthorization(ApiScopes.CmsContentRead).WithTags("External CMS");
        external.AddEndpointFilter(async (context, next) => { context.HttpContext.Response.Headers.CacheControl = "no-store"; return await next(context); });
        external.MapGet("/{key}/items", async (string key, [AsParameters] ContentQuery query, IContentCms store, ClaimsPrincipal user, CancellationToken ct, string? fields = null, int expand = 0) =>
            (await store.Published(key, query, fields, expand, new(false, user.FindAll("cms_collection").Select(x => x.Value).ToArray()), ct)).ToHttp()).WithName("ListPublishedContent").Produces<Page<PublishedContent>>();
        external.MapGet("/{key}/items/{id:guid}", async (string key, Guid id, IContentCms store, ClaimsPrincipal user, CancellationToken ct, string? fields = null, int expand = 0) =>
            (await store.PublishedItem(key, id, fields, expand, new(false, user.FindAll("cms_collection").Select(x => x.Value).ToArray()), ct)).ToHttp()).WithName("GetPublishedContent").Produces<PublishedContent>();
        var publicContent = app.MapGroup("/api/public/cms/collections").OwnedByModule(ModuleIds.Cms).RequireCapability(CapabilityIds.Cms).AllowAnonymous().WithTags("Public CMS");
        publicContent.AddEndpointFilter(async (context, next) => { context.HttpContext.Response.Headers.CacheControl = "no-store"; return await next(context); });
        publicContent.MapGet("/{key}/items", async (string key, [AsParameters] ContentQuery query, IContentCms store, CancellationToken ct, string? fields = null, int expand = 0) =>
            (await store.Published(key, query, fields, expand, new(true, []), ct)).ToHttp()).WithName("ListPublicContent").Produces<Page<PublishedContent>>();
        publicContent.MapGet("/{key}/items/{id:guid}", async (string key, Guid id, IContentCms store, CancellationToken ct, string? fields = null, int expand = 0) =>
            (await store.PublishedItem(key, id, fields, expand, new(true, []), ct)).ToHttp()).WithName("GetPublicContent").Produces<PublishedContent>();
    }
}
