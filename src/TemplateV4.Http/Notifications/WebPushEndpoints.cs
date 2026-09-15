using System.Security.Claims;
using TemplateV4.Infrastructure;

namespace TemplateV4.ApiService.Endpoints;

public static class WebPushEndpoints
{
    public static RouteGroupBuilder MapWebPushEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/notifications/push", async (WebPushService service, ClaimsPrincipal principal, CancellationToken ct) => Results.Ok(await service.Status(EndpointSecurity.Actor(principal), ct)))
            .RequireAuthorization().WithName("GetWebPushStatus").Produces<WebPushStatus>();
        group.MapPost("/notifications/push/subscribe", async (WebPushRegistration request, WebPushService service, ClaimsPrincipal principal, CancellationToken ct) => (await service.Register(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization().WithName("RegisterWebPush");
        group.MapPost("/notifications/push/preferences", async (WebPushPreference request, WebPushService service, ClaimsPrincipal principal, CancellationToken ct) => (await service.Preferences(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization().WithName("SaveWebPushPreferences");
        return group;
    }
}
