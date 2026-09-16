using TemplateV4.Application.Customers;
using System.Security.Claims;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class OrganisationAttachmentEndpoints
{
    public static RouteGroupBuilder MapOrganisationAttachmentEndpoints(this RouteGroupBuilder group)
    {
        MapRecords(group, "crm", ModuleIds.Crm, CapabilityIds.CrmFiles, AttachmentRecordKind.Crm);
        MapRecords(group, "invoicing", ModuleIds.Invoicing, CapabilityIds.InvoicingFiles, AttachmentRecordKind.Invoicing);
        var files = group.MapGroup("/organisation/attachments").RequireAuthorization().OwnedByModule(ModuleIds.Organisations).RequireCapability(CapabilityIds.OrganisationFiles);
        files.MapGet("", async (ClaimsPrincipal user, IOrganisationAttachments library, CancellationToken ct, int pageNumber = 1, int pageSize = 10) =>
            (await library.List(Guid.Parse(user.FindFirstValue("sub")!), pageNumber, pageSize, ct)).ToHttp()).WithName("ListOrganisationAttachments").Produces<Page<OrganisationAttachment>>();
        files.MapGet("/{id:guid}", async (Guid id, ClaimsPrincipal user, IOrganisationAttachments library, CancellationToken ct) =>
            (await library.Resolve(Guid.Parse(user.FindFirstValue("sub")!), id, ct)).ToHttp()).WithName("GetOrganisationAttachment").Produces<OrganisationAttachment>();
        files.MapPost("/upload", async (string name, ClaimsPrincipal user, HttpContext context, IOrganisationAttachments library, TemplateV4.Infrastructure.Storage.MyFilesService settings, CancellationToken ct) =>
        {
            var max = (await settings.Settings(ct)).MaxUploadBytes;
            var limit = context.Features.Get<Microsoft.AspNetCore.Http.Features.IHttpMaxRequestBodySizeFeature>();
            if (limit is { IsReadOnly: false }) limit.MaxRequestBodySize = max == 0 ? null : max;
            if (max > 0 && context.Request.ContentLength > max) return Results.StatusCode(413);
            return (await library.Upload(Guid.Parse(user.FindFirstValue("sub")!), name, context.Request.Body, ct)).ToHttp();
        }).WithName("UploadOrganisationAttachment").Produces<OrganisationAttachment>();
        return group;
    }
    private static void MapRecords(RouteGroupBuilder group, string path, string module, string capability, AttachmentRecordKind kind)
    {
        var records = group.MapGroup($"/organisation/{path}/{{id:guid}}/attachments").RequireAuthorization().OwnedByModule(module).RequireCapability(capability);
        records.MapGet("", async (Guid id, ClaimsPrincipal user, IRecordAttachments attachments, CancellationToken ct) =>
            (await attachments.List(Guid.Parse(user.FindFirstValue("sub")!), kind, id, ct)).ToHttp()).WithName("List" + kind + "Attachments").Produces<RecordAttachment[]>();
        records.MapPost("", async (Guid id, ClaimsPrincipal user, ChangeRecordAttachment change, IRecordAttachments attachments, CancellationToken ct) =>
            (await attachments.Change(Guid.Parse(user.FindFirstValue("sub")!), kind, id, change, ct)).ToHttp()).WithName("Change" + kind + "Attachment");
    }
}
