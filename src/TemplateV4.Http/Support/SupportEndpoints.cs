using TemplateV4.Application.Modules;
using TemplateV4.Application.Support;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class SupportEndpoints
{
    public static RouteGroupBuilder MapSupportEndpoints(this RouteGroupBuilder group)
    {
        var support = group.MapGroup("/support").OwnedByModule(ModuleIds.Support).RequireCapability(CapabilityIds.Support).RequireAuthorization();
        support.MapGet("/", async ([AsParameters] ListTickets query, Dispatcher<ListTickets, Page<TicketItem>> dispatcher, CancellationToken ct) => (await dispatcher.Send(query, ct)).ToHttp())
            .WithName("ListSupportTickets").Produces<Page<TicketItem>>();
        support.MapGet("/options", async (ISupportTickets store, CancellationToken ct, string search = "") => (await store.Options(search, ct)).ToHttp())
            .WithName("GetSupportOptions").Produces<SupportOptions>();
        support.MapGet("/{id:guid}", async (Guid id, Dispatcher<GetTicket, TicketDetail> dispatcher, CancellationToken ct, int pageNumber = 1) => (await dispatcher.Send(new(id, pageNumber), ct)).ToHttp())
            .WithName("GetSupportTicket").Produces<TicketDetail>();
        support.MapPost("/", async (CreateTicket request, Dispatcher<CreateTicket, Guid> dispatcher, CancellationToken ct) => (await dispatcher.Send(request, ct)).ToHttp())
            .WithName("CreateSupportTicket").Produces<Guid>();
        support.MapPost("/reply", async (ReplyTicket request, Dispatcher<ReplyTicket, Unit> dispatcher, CancellationToken ct) => (await dispatcher.Send(request, ct)).ToHttp())
            .WithName("ReplySupportTicket");
        support.MapPost("/update", async (UpdateTicket request, Dispatcher<UpdateTicket, Unit> dispatcher, CancellationToken ct) => (await dispatcher.Send(request, ct)).ToHttp())
            .WithName("UpdateSupportTicket");
        support.MapPost("/categories", async (SaveSupportCategory request, Dispatcher<SaveSupportCategory, Unit> dispatcher, CancellationToken ct) => (await dispatcher.Send(request, ct)).ToHttp())
            .RequireAuthorization(Permissions.SupportAdmin).WithName("SaveSupportCategory");
        support.MapPost("/attachments", async (AttachTicket request, Dispatcher<AttachTicket, Unit> dispatcher, CancellationToken ct) => (await dispatcher.Send(request, ct)).ToHttp())
            .WithMetadata(new Microsoft.AspNetCore.Mvc.RequestSizeLimitAttribute(8 * 1024 * 1024))
            .WithName("AttachSupportTicket");
        support.MapGet("/{id:guid}/attachments/{attachmentId:guid}", async (Guid id, Guid attachmentId, ISupportTickets store, HttpContext http, CancellationToken ct) =>
        {
            var result = await store.Download(id, attachmentId, ct);
            http.Response.Headers.CacheControl = "no-store";
            http.Response.Headers.XContentTypeOptions = "nosniff";
            return result.IsSuccess ? Results.File(result.Value!.Content, "application/octet-stream", result.Value.Name) : result.ToHttp();
        }).WithName("DownloadSupportAttachment").Produces(200, contentType: "application/octet-stream");
        return group;
    }
}
