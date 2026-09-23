using TemplateV4.Application.Modules;
using TemplateV4.Application.Support;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class AttachmentsEndpoints
{
    public static void MapSupportAttachments(this RouteGroupBuilder support)
    {
        support.MapPost("/attachments", async (AttachTicket request, Dispatcher<AttachTicket, Unit> dispatcher, CancellationToken ct) => (await dispatcher.Send(request, ct)).ToHttp())
            .WithMetadata(new Microsoft.AspNetCore.Mvc.RequestSizeLimitAttribute(8 * 1024 * 1024))
            .WithName("AttachSupportTicket");
        support.MapGet("/{id:guid}/attachments/{attachmentId:guid}", async (Guid id, Guid attachmentId, ISupportAttachments store, HttpContext http, CancellationToken ct) =>
        {
            var result = await store.Download(id, attachmentId, ct);
            http.Response.Headers.CacheControl = "no-store";
            http.Response.Headers.XContentTypeOptions = "nosniff";
            return result.IsSuccess ? Results.File(result.Value!.Content, "application/octet-stream", result.Value.Name) : result.ToHttp();
        }).WithName("DownloadSupportAttachment").Produces(200, contentType: "application/octet-stream");
    }
}
