using TemplateV4.Application.Customers;
using System.Security.Claims;
using TemplateV4.Application.Invoicing;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class InvoicingEndpoints
{
    public static RouteGroupBuilder MapInvoicingEndpoints(this RouteGroupBuilder group)
    {
        var invoices = group.MapGroup("/organisation/invoicing").RequireAuthorization().OwnedByModule(ModuleIds.CommercialBilling);
        var work = invoices.MapGroup("").RequireCapability(CapabilityIds.Invoicing);
        work.MapPost("/{id:guid}/store-pdf", async (Guid id, ClaimsPrincipal user, IInvoicing store, ICustomers organisations, TemplateV4.Application.Crm.IOrganisationAttachments files, TemplateV4.Application.Crm.IRecordAttachments attachments, CancellationToken ct) =>
        {
            var actor = Actor(user); var document = await store.Read(actor, id, ct);
            if (!document.IsSuccess) return document.ToHttp();
            var logo = document.Value!.Document.Snapshot.OrganisationLogoId is { } logoId ? await organisations.Logo(logoId, ct) : null;
            using var content = new MemoryStream(TemplateV4.Infrastructure.Invoicing.CommercialPdf.Render(document.Value!, logo?.Png));
            var uploaded = await files.Upload(actor, document.Value!.Document.Number + ".pdf", content, ct);
            if (!uploaded.IsSuccess) return uploaded.ToHttp();
            return (await attachments.Change(actor, TemplateV4.Application.Crm.AttachmentRecordKind.Invoicing, id, new(uploaded.Value!.Id, true), ct)).ToHttp();
        }).RequireCapability(CapabilityIds.InvoicingFiles).WithName("StoreCommercialPdf");
        invoices.MapPost("/{id:guid}/invoice", async (Guid id, Guid idempotencyKey, ClaimsPrincipal user, IInvoicing store, CancellationToken ct) =>
            (await store.InvoiceAccepted(Actor(user), id, idempotencyKey, ct)).ToHttp()).WithName("InvoiceAcceptedQuotation").Produces<CommercialDocument>().ContinuesWhenDisabled(ModuleIds.CommercialBilling, "Fulfil an accepted quotation from its immutable snapshot, including when CRM is unavailable");
        work.MapPost("/preview", async (ClaimsPrincipal user, PreviewCommercialDocument request, IInvoicing store, CancellationToken ct) => (await store.Preview(Actor(user), request, ct)).ToHttp()).WithName("PreviewCommercialDocument").Produces<TemplateV4.Domain.Invoicing.CommercialTotals>();
        invoices.MapGet("/{id:guid}/pdf", async (Guid id, ClaimsPrincipal user, IInvoicing store, ICustomers organisations, CancellationToken ct) =>
        {
            var result = await store.Read(Actor(user), id, ct);
            if (!result.IsSuccess) return result.ToHttp();
            var logo = result.Value!.Document.Snapshot.OrganisationLogoId is { } logoId ? await organisations.Logo(logoId, ct) : null;
            return Results.File(TemplateV4.Infrastructure.Invoicing.CommercialPdf.Render(result.Value!, logo?.Png), "application/pdf", result.Value.Document.Number + ".pdf");
        }).WithName("DownloadCommercialPdf").Produces<byte[]>(200, "application/pdf").ContinuesWhenDisabled(ModuleIds.CommercialBilling, "Download retained documents for existing obligations after application permission checks");
        work.MapPost("", async (ClaimsPrincipal user, IssueCommercialDocument request, IInvoicing store, CancellationToken ct) => request.Origin != null
            ? ApiResults.Failure(new("validation.failed", ErrorKind.Validation))
            : (await store.Issue(Actor(user), request, ct)).ToHttp()).WithName("IssueCommercialDocument").Produces<CommercialDocument>();
        work.MapPost("/{id:guid}/accept", async (Guid id, ClaimsPrincipal user, AcceptQuotation request, IInvoicing store, CancellationToken ct) => (await store.Accept(Actor(user), id, request, ct)).ToHttp()).WithName("AcceptCommercialQuotation").Produces<CommercialDocument>();
        work.MapPost("/settings", async (ClaimsPrincipal user, IssuerSettings request, IInvoicing store, CancellationToken ct) => (await store.Configure(Actor(user), request, ct)).ToHttp()).WithName("ConfigureInvoicing").Produces<IssuerSettings>();
        invoices.MapGet("/settings", async (ClaimsPrincipal user, IInvoicing store, CancellationToken ct) => (await store.Settings(Actor(user), ct)).ToHttp()).WithName("GetInvoicingSettings").Produces<IssuerSettings>().ContinuesWhenDisabled(ModuleIds.CommercialBilling, "Read issuer details associated with retained obligations");
        invoices.MapGet("", async (ClaimsPrincipal user, IInvoicing store, CancellationToken ct, int pageNumber = 1, int pageSize = 10, string search = "", string sort = "issuedAt", string direction = "desc", string group = "") => (await store.List(Actor(user), pageNumber, pageSize, search, sort, direction, group, ct)).ToHttp()).WithName("ListCommercialDocuments").Produces<Page<CommercialDocument>>().ContinuesWhenDisabled(ModuleIds.CommercialBilling, "Find retained commercial documents");
        invoices.MapGet("/{id:guid}", async (Guid id, ClaimsPrincipal user, IInvoicing store, CancellationToken ct) => (await store.Read(Actor(user), id, ct)).ToHttp()).WithName("GetCommercialDocument").Produces<CommercialDetail>().ContinuesWhenDisabled(ModuleIds.CommercialBilling, "Read retained commercial documents and correction history");
        invoices.MapPost("/{id:guid}/payment", async (Guid id, ClaimsPrincipal user, CommercialAction request, IInvoicing store, CancellationToken ct) => (await store.Settle(Actor(user), id, request, ct)).ToHttp()).WithName("RecordCommercialPayment").Produces<FinancialEntry>().ContinuesWhenDisabled(ModuleIds.CommercialBilling, "Settle an existing invoice after application permission and balance checks");
        invoices.MapPost("/{id:guid}/credit", async (Guid id, ClaimsPrincipal user, CommercialAction request, IInvoicing store, CancellationToken ct) => (await store.Credit(Actor(user), id, request, ct)).ToHttp()).WithName("CreditCommercialInvoice").Produces<FinancialEntry>().ContinuesWhenDisabled(ModuleIds.CommercialBilling, "Correct an existing invoice without rewriting issued history");
        invoices.MapPost("/{id:guid}/refund", async (Guid id, ClaimsPrincipal user, CommercialAction request, IInvoicing store, CancellationToken ct) => (await store.Refund(Actor(user), id, request, ct)).ToHttp()).WithName("RefundCommercialInvoice").Produces<FinancialEntry>().ContinuesWhenDisabled(ModuleIds.CommercialBilling, "Record a refund within the credited paid balance");
        return group;
    }
    private static Guid Actor(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue("sub")!);
}
