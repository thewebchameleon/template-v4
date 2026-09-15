using TemplateV4.Application.Modules;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class AuditEndpoints
{
    public static RouteGroupBuilder MapAuditEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/audit", async ([AsParameters] AuditQuery query, Dispatcher<AuditQuery, Page<AuditItem>> dispatcher, CancellationToken ct) => (await dispatcher.Send(query, ct)).ToHttp())
            .OwnedByModule(ModuleIds.AuditHistory).RequireCapability(CapabilityIds.AuditHistory).RequireAuthorization(Permissions.Settings).WithName("ListAuditHistory").Produces<Page<AuditItem>>();
        group.MapGet("/audit/{id:long}", async (long id, Dispatcher<GetAuditDetail, AuditDetail> dispatcher, CancellationToken ct) => (await dispatcher.Send(new(id), ct)).ToHttp())
            .OwnedByModule(ModuleIds.AuditHistory).RequireCapability(CapabilityIds.AuditHistory).RequireAuthorization(Permissions.Settings).WithName("GetAuditDetail").Produces<AuditDetail>();
        return group;
    }
}
