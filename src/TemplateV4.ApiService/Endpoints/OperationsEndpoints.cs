using System.Security.Claims;
using TemplateV4.Application;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure;

namespace TemplateV4.ApiService.Endpoints;

public static class OperationsEndpoints
{
    public static RouteGroupBuilder MapOperationsEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/operations", async (OperationsService service, CancellationToken ct, string kind = "message", int pageNumber = 1, int pageSize = 25, bool failedOnly = false) =>
                (await service.List(kind, pageNumber, pageSize, failedOnly, ct)).ToHttp())
            .RequireAuthorization(Permissions.Settings).WithName("GetDeliveryOperations").Produces<DeliveryPage>();
        group.MapPost("/operations/replay", async (ReplayRequest request, OperationsService service, ClaimsPrincipal principal, CancellationToken ct) =>
                (await service.Replay(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization(Permissions.Settings).WithName("ReplayDelivery");

        return group;
    }
}
