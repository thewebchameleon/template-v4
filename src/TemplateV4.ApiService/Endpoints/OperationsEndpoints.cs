using System.Security.Claims;
using TemplateV4.Application;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure;

namespace TemplateV4.ApiService.Endpoints;

public static class OperationsEndpoints
{
    public static RouteGroupBuilder MapOperationsEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/operations", async (OperationsService service, CancellationToken ct) => await service.List(ct))
            .RequireAuthorization(Permissions.Settings).WithName("GetDeliveryOperations");
        group.MapPost("/operations/replay", async (ReplayRequest request, OperationsService service, ClaimsPrincipal principal, CancellationToken ct) =>
                (await service.Replay(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization(Permissions.Settings).WithName("ReplayDelivery");

        return group;
    }
}
