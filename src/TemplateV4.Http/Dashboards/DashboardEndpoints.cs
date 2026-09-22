using System.Security.Claims;
using TemplateV4.Application.Dashboards;

namespace TemplateV4.ApiService.Endpoints;

public static class DashboardEndpoints
{
    public static RouteGroupBuilder MapDashboardEndpoints(this RouteGroupBuilder group)
    {
        var dashboards = group.MapGroup("/dashboards").RequireAuthorization();
        dashboards.MapGet("", (IDashboards service, ClaimsPrincipal user, CancellationToken ct) => service.Read(EndpointSecurity.Actor(user), ct)).WithName("GetDashboards");
        dashboards.MapPost("/save", async (SaveDashboard request, IDashboards service, ClaimsPrincipal user, CancellationToken ct) => (await service.Save(EndpointSecurity.Actor(user), request, ct)).ToHttp()).WithName("SaveDashboard").Produces<DashboardDto>();
        dashboards.MapPost("/reset", async (DashboardChange request, IDashboards service, ClaimsPrincipal user, CancellationToken ct) => (await service.Reset(EndpointSecurity.Actor(user), request, ct)).ToHttp()).WithName("ResetDashboard");
        dashboards.MapPost("/delete", async (DashboardChange request, IDashboards service, ClaimsPrincipal user, CancellationToken ct) => (await service.Delete(EndpointSecurity.Actor(user), request, ct)).ToHttp()).WithName("DeleteDashboard");
        dashboards.MapPost("/starting", async (DashboardPreference request, IDashboards service, ClaimsPrincipal user, CancellationToken ct) => (await service.SetStarting(EndpointSecurity.Actor(user), request, ct)).ToHttp()).WithName("SetStartingDashboard");
        dashboards.MapGet("/card", async ([AsParameters] DashboardCardQuery query, IDashboards service, ClaimsPrincipal user, CancellationToken ct) => (await service.Card(EndpointSecurity.Actor(user), query, ct)).ToHttp()).WithName("GetDashboardCard").Produces<DashboardCardData>();
        return group;
    }
}
