using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class ConfigurationEndpoints
{
    public static RouteGroupBuilder MapConfigurationEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/appearance", async (IPlatformAppearance appearance, HttpResponse response, CancellationToken ct) =>
        {
            response.Headers.CacheControl = "no-store";
            var value = await appearance.Read(ct);
            return Results.Ok(new PublicAppearance(value.PrimaryColor, value.LoginBackground));
        }).AllowAnonymous().WithName("GetPublicAppearance").Produces<PublicAppearance>();

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
