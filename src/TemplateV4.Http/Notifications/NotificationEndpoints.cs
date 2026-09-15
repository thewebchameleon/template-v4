using System.Security.Claims;
using TemplateV4.Infrastructure;

namespace TemplateV4.ApiService.Endpoints;

public static class NotificationEndpoints
{
    public static RouteGroupBuilder MapNotificationEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/notifications/summary", async (NotificationService service, ClaimsPrincipal principal, CancellationToken ct) => Results.Ok(await service.Summary(EndpointSecurity.Actor(principal), ct)))
            .RequireAuthorization().WithName("GetNotificationSummary").Produces<NotificationSummary>();
        group.MapGet("/notifications", async (NotificationService service, ClaimsPrincipal principal, CancellationToken ct, int pageNumber = 1, int pageSize = 25, bool unreadOnly = false, string sort = "createdAt", string direction = "desc") => (await service.List(EndpointSecurity.Actor(principal), pageNumber, pageSize, unreadOnly, sort, direction, ct)).ToHttp())
            .RequireAuthorization().WithName("ListNotifications").Produces<NotificationPage>();
        group.MapPost("/notifications/read", async (NotificationService service, ClaimsPrincipal principal, CancellationToken ct, Guid? id = null, bool read = true) => (await service.Read(EndpointSecurity.Actor(principal), id, read, ct)).ToHttp())
            .RequireAuthorization().WithName("ReadNotifications");
        group.MapPost("/notifications/preferences", async (NotificationPreference request, NotificationService service, ClaimsPrincipal principal, CancellationToken ct) => (await service.Preferences(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization().WithName("SaveNotificationPreferences");
        return group;
    }
}
