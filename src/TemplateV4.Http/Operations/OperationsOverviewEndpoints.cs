using TemplateV4.Application.Users;
using TemplateV4.Infrastructure;

namespace TemplateV4.ApiService.Endpoints;

public static class OperationsOverviewEndpoints
{
    public static RouteGroupBuilder MapOperationsOverviewEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/operations/overview", async (OperationsService service, CancellationToken ct) => Results.Ok(await service.Overview(ct)))
            .RequireAuthorization(Permissions.Settings).WithName("GetOperationsOverview").Produces<OperationsOverview>();
        return group;
    }
}
