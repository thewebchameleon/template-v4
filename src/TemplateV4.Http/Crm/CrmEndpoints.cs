using System.Security.Claims;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class CrmEndpoints
{
    public static RouteGroupBuilder MapCrmEndpoints(this RouteGroupBuilder group)
    {
        var crm = group.MapGroup("/organisations/{organisation:guid}/crm").RequireAuthorization().OwnedByModule(ModuleIds.Crm).RequireCapability(CapabilityIds.Crm);
        crm.MapGet("", async (Guid organisation, ClaimsPrincipal user, ICrm store, CancellationToken ct, CrmRecordKind kind = CrmRecordKind.Contact, string search = "", bool archived = false, int pageNumber = 1, int pageSize = 10, string sort = "name", string direction = "asc") =>
            (await store.List(Actor(user), organisation, new(kind, search, archived, pageNumber, pageSize, sort, direction), ct)).ToHttp()).WithName("ListCrmRecords").Produces<Page<CrmRecord>>();
        crm.MapGet("/overview", async (Guid organisation, ClaimsPrincipal user, ICrm store, CancellationToken ct) => (await store.Overview(Actor(user), organisation, ct)).ToHttp()).WithName("GetCrmOverview").Produces<CrmOverview>();
        crm.MapGet("/configuration", async (Guid organisation, ClaimsPrincipal user, ICrm store, CancellationToken ct) => (await store.Configuration(Actor(user), organisation, ct)).ToHttp()).WithName("GetCrmConfiguration").Produces<CrmConfiguration>();
        crm.MapPost("/configuration", async (Guid organisation, ClaimsPrincipal user, CrmConfiguration request, ICrm store, CancellationToken ct) => (await store.Configure(Actor(user), organisation, request, ct)).ToHttp()).WithName("ConfigureCrm").Produces<CrmConfiguration>();
        crm.MapGet("/{id:guid}", async (Guid organisation, Guid id, ClaimsPrincipal user, ICrm store, CancellationToken ct) => (await store.Detail(Actor(user), organisation, id, ct)).ToHttp()).WithName("GetCrmDetail").Produces<CrmDetail>();
        crm.MapPost("", async (Guid organisation, ClaimsPrincipal user, SaveCrmRecord request, ICrm store, CancellationToken ct) => (await store.Save(Actor(user), organisation, request, ct)).ToHttp()).WithName("SaveCrmRecord").Produces<CrmRecord>();
        crm.MapPost("/{id:guid}/archive", async (Guid organisation, Guid id, ClaimsPrincipal user, ArchiveCrmRecord request, ICrm store, CancellationToken ct) => (await store.Archive(Actor(user), organisation, id, request, ct)).ToHttp()).WithName("ArchiveCrmRecord").Produces<CrmRecord>();
        crm.MapPost("/{id:guid}/notes", async (Guid organisation, Guid id, ClaimsPrincipal user, AddCrmNote request, ICrm store, CancellationToken ct) => (await store.Note(Actor(user), organisation, id, request, ct)).ToHttp()).WithName("AddCrmNote").Produces<CrmNote>();
        return group;
    }
    private static Guid Actor(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue("sub")!);
}
