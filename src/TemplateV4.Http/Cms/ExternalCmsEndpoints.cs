using TemplateV4.Application.ApiKeys;
using TemplateV4.Application.Cms;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.ApiService;

namespace TemplateV4.ApiService.Endpoints;

public static class ExternalCmsEndpoints
{
    public static void MapExternalCmsEndpoints(this WebApplication app)
    {
        app.MapPublishedContentEndpoints();
        var cms = app.MapGroup("/api/external/cms")
            .WithTags("External CMS")
            .OwnedByModule(ModuleIds.Cms)
            .RequireCapability(CapabilityIds.Cms);
        cms.MapGet("/articles", async (ICms store, CancellationToken ct, int pageNumber = 1, int pageSize = 10) =>
            (await store.Blog(pageNumber, pageSize, ct)).ToHttp())
            .RequireAuthorization(ApiScopes.CmsArticlesRead)
            .WithName("ListExternalCmsArticles").Produces<Page<BlogSummary>>();
        cms.MapGet("/articles/{slug}", async (string slug, ICms store, CancellationToken ct) => (await store.Article(slug, ct)).ToHttp())
            .RequireAuthorization(ApiScopes.CmsArticlesRead)
            .WithName("GetExternalCmsArticle").Produces<BlogArticle>();
        cms.MapGet("/sections", async (ICmsSections store, CancellationToken ct) => (await store.Public(ct)).ToHttp())
            .RequireAuthorization(ApiScopes.CmsSectionsRead)
            .WithName("GetExternalCmsSections").Produces<LandingSection[]>();
    }
}
