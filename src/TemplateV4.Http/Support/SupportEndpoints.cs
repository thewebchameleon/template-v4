using TemplateV4.Application.Modules;
using TemplateV4.Application.Support;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class SupportEndpoints
{
    public static RouteGroupBuilder MapSupportEndpoints(this RouteGroupBuilder group)
    {
        var support = group.MapGroup("/support").OwnedByModule(ModuleIds.Support).RequireCapability(CapabilityIds.SupportTickets).RequireAuthorization();
        support.MapGet("/", async ([AsParameters] ListTickets query, Dispatcher<ListTickets, Page<TicketItem>> dispatcher, CancellationToken ct) => (await dispatcher.Send(query, ct)).ToHttp())
            .WithName("ListSupportTickets").Produces<Page<TicketItem>>();
        support.MapGet("/options", async (ISupportCategories store, CancellationToken ct, string search = "") => (await store.Options(search, ct)).ToHttp())
            .WithName("GetSupportOptions").Produces<SupportOptions>();
        support.MapGet("/{id:guid}", async (Guid id, Dispatcher<GetTicket, TicketDetail> dispatcher, CancellationToken ct, int pageNumber = 1) => (await dispatcher.Send(new(id, pageNumber), ct)).ToHttp())
            .WithName("GetSupportTicket").Produces<TicketDetail>();
        support.MapPost("/", async (CreateTicket request, Dispatcher<CreateTicket, Guid> dispatcher, CancellationToken ct) => (await dispatcher.Send(request, ct)).ToHttp())
            .WithName("CreateSupportTicket").Produces<Guid>();
        support.MapPost("/reply", async (ReplyTicket request, Dispatcher<ReplyTicket, Unit> dispatcher, CancellationToken ct) => (await dispatcher.Send(request, ct)).ToHttp())
            .WithName("ReplySupportTicket");
        support.MapPost("/update", async (UpdateTicket request, Dispatcher<UpdateTicket, Unit> dispatcher, CancellationToken ct) => (await dispatcher.Send(request, ct)).ToHttp())
            .WithName("UpdateSupportTicket");
        support.MapSupportCategories();
        support.MapSupportAttachments();
        return group;
    }
}
