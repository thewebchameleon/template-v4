using System.Security.Claims;
using TemplateV4.Application.Invoicing;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class InvoicingEndpoints
{
    public static RouteGroupBuilder MapInvoicingEndpoints(this RouteGroupBuilder group)
    {
        var invoices = group.MapGroup("/organisations/{organisation:guid}/invoicing").RequireAuthorization().OwnedByModule(ModuleIds.Invoicing);
        var work = invoices.MapGroup("").RequireCapability(CapabilityIds.Invoicing);
        work.MapPost("/{id:guid}/store-pdf", async (Guid organisation, Guid id, ClaimsPrincipal user, IInvoicing store, TemplateV4.Application.Crm.IOrganisationAttachments files, TemplateV4.Application.Crm.IRecordAttachments attachments, CancellationToken ct) =>
        {
            var actor = Actor(user); var document = await store.Read(actor, organisation, id, ct);
            if (!document.IsSuccess) return document.ToHttp();
            using var content = new MemoryStream(TemplateV4.Infrastructure.Invoicing.CommercialPdf.Render(document.Value!));
            var uploaded = await files.Upload(actor, organisation, document.Value!.Document.Number + ".pdf", content, ct);
            if (!uploaded.IsSuccess) return uploaded.ToHttp();
            return (await attachments.Change(actor, organisation, TemplateV4.Application.Crm.AttachmentRecordKind.Invoicing, id, new(uploaded.Value!.Id, true), ct)).ToHttp();
        }).RequireCapability(CapabilityIds.InvoicingFiles).WithName("StoreCommercialPdf");
        invoices.MapPost("/{id:guid}/invoice", async (Guid organisation, Guid id, Guid idempotencyKey, ClaimsPrincipal user, IInvoicing store, CancellationToken ct) =>
            (await store.InvoiceAccepted(Actor(user), organisation, id, idempotencyKey, ct)).ToHttp()).WithName("InvoiceAcceptedQuotation").Produces<CommercialDocument>().ContinuesWhenDisabled(ModuleIds.Invoicing, "Fulfil an accepted quotation from its immutable snapshot, including when CRM is unavailable");
        work.MapPost("/preview", async (Guid organisation, ClaimsPrincipal user, PreviewCommercialDocument request, IInvoicing store, CancellationToken ct) => (await store.Preview(Actor(user), organisation, request, ct)).ToHttp()).WithName("PreviewCommercialDocument").Produces<TemplateV4.Domain.Invoicing.CommercialTotals>();
        invoices.MapGet("/{id:guid}/pdf", async (Guid organisation, Guid id, ClaimsPrincipal user, IInvoicing store, CancellationToken ct) =>
        {
            var result = await store.Read(Actor(user), organisation, id, ct);
            return result.IsSuccess ? Results.File(TemplateV4.Infrastructure.Invoicing.CommercialPdf.Render(result.Value!), "application/pdf", result.Value!.Document.Number + ".pdf") : result.ToHttp();
        }).WithName("DownloadCommercialPdf").Produces<byte[]>(200, "application/pdf").ContinuesWhenDisabled(ModuleIds.Invoicing, "Download retained documents for existing obligations after live membership checks");
        work.MapPost("", async (Guid organisation, ClaimsPrincipal user, IssueCommercialDocument request, IInvoicing store, CancellationToken ct) => request.Origin != null
            ? ApiResults.Failure(new("validation.failed", ErrorKind.Validation))
            : (await store.Issue(Actor(user), organisation, request, ct)).ToHttp()).WithName("IssueCommercialDocument").Produces<CommercialDocument>();
        work.MapPost("/{id:guid}/accept", async (Guid organisation, Guid id, ClaimsPrincipal user, AcceptQuotation request, IInvoicing store, CancellationToken ct) => (await store.Accept(Actor(user), organisation, id, request, ct)).ToHttp()).WithName("AcceptCommercialQuotation").Produces<CommercialDocument>();
        work.MapPost("/settings", async (Guid organisation, ClaimsPrincipal user, IssuerSettings request, IInvoicing store, CancellationToken ct) => (await store.Configure(Actor(user), organisation, request, ct)).ToHttp()).WithName("ConfigureInvoicing").Produces<IssuerSettings>();
        invoices.MapGet("/settings", async (Guid organisation, ClaimsPrincipal user, IInvoicing store, CancellationToken ct) => (await store.Settings(Actor(user), organisation, ct)).ToHttp()).WithName("GetInvoicingSettings").Produces<IssuerSettings>().ContinuesWhenDisabled(ModuleIds.Invoicing, "Read issuer details associated with retained obligations");
        invoices.MapGet("", async (Guid organisation, ClaimsPrincipal user, IInvoicing store, CancellationToken ct, int pageNumber = 1, int pageSize = 10, string search = "", string sort = "issuedAt", string direction = "desc") => (await store.List(Actor(user), organisation, pageNumber, pageSize, search, sort, direction, ct)).ToHttp()).WithName("ListCommercialDocuments").Produces<Page<CommercialDocument>>().ContinuesWhenDisabled(ModuleIds.Invoicing, "Find retained commercial documents");
        invoices.MapGet("/{id:guid}", async (Guid organisation, Guid id, ClaimsPrincipal user, IInvoicing store, CancellationToken ct) => (await store.Read(Actor(user), organisation, id, ct)).ToHttp()).WithName("GetCommercialDocument").Produces<CommercialDetail>().ContinuesWhenDisabled(ModuleIds.Invoicing, "Read retained commercial documents and correction history");
        invoices.MapPost("/{id:guid}/payment", async (Guid organisation, Guid id, ClaimsPrincipal user, CommercialAction request, IInvoicing store, CancellationToken ct) => (await store.Settle(Actor(user), organisation, id, request, ct)).ToHttp()).WithName("RecordCommercialPayment").Produces<FinancialEntry>().ContinuesWhenDisabled(ModuleIds.Invoicing, "Settle an existing invoice after live membership and balance checks");
        invoices.MapPost("/{id:guid}/credit", async (Guid organisation, Guid id, ClaimsPrincipal user, CommercialAction request, IInvoicing store, CancellationToken ct) => (await store.Credit(Actor(user), organisation, id, request, ct)).ToHttp()).WithName("CreditCommercialInvoice").Produces<FinancialEntry>().ContinuesWhenDisabled(ModuleIds.Invoicing, "Correct an existing invoice without rewriting issued history");
        invoices.MapPost("/{id:guid}/refund", async (Guid organisation, Guid id, ClaimsPrincipal user, CommercialAction request, IInvoicing store, CancellationToken ct) => (await store.Refund(Actor(user), organisation, id, request, ct)).ToHttp()).WithName("RefundCommercialInvoice").Produces<FinancialEntry>().ContinuesWhenDisabled(ModuleIds.Invoicing, "Record a refund within the credited paid balance");
        return group;
    }
    private static Guid Actor(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue("sub")!);
}
