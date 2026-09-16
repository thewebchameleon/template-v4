using TemplateV4.Application.Platform;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class ConfigurationEndpoints
{
    public static RouteGroupBuilder MapConfigurationEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/appearance", async (IPlatformAppearance appearance, ICustomers organisations, HttpResponse response, CancellationToken ct) =>
        {
            response.Headers.CacheControl = "no-store";
            var value = await appearance.Read(ct);
            var brand = await organisations.Branding(ct);
            return Results.Ok(new PublicAppearance(value.PrimaryColor, brand.Name, brand.LogoUrl, value.LoginBackground));
        }).AllowAnonymous().WithName("GetPublicAppearance").Produces<PublicAppearance>();
        group.MapGet("/appearance/logos/{id:guid}", async (Guid id, ICustomers organisations, HttpResponse response, CancellationToken ct) =>
        {
            var logo = await organisations.Logo(id, ct);
            if (logo is null) return Results.NotFound();
            response.Headers.CacheControl = "public,max-age=31536000,immutable";
            response.Headers.XContentTypeOptions = "nosniff";
            return Results.File(logo.Png, "image/png");
        }).AllowAnonymous().WithName("GetOrganisationLogo").Produces(200, contentType: "image/png");

        var admin = group.MapGroup("/configuration/appearance").RequireAuthorization(Permissions.Settings)
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));
        admin.MapGet("", async (IPlatformAppearance appearance, HttpResponse response, CancellationToken ct) =>
        {
            response.Headers.CacheControl = "no-store";
            return Results.Ok(await appearance.Read(ct));
        }).WithName("GetPlatformAppearance").Produces<PlatformAppearance>();
        admin.MapPost("", async (SavePlatformAppearance request, Dispatcher<SavePlatformAppearance, PlatformAppearance> dispatcher, CancellationToken ct) =>
            (await dispatcher.Send(request, ct)).ToHttp()).WithName("SavePlatformAppearance").Produces<PlatformAppearance>();
        return group;
    }
}
