using TemplateV4.Application.Crm;
using TemplateV4.Application.Users;
using TemplateV4.Domain.Invoicing;

namespace TemplateV4.Application.Invoicing;

public sealed record IssuerSettings(Guid Version, string Name, string Address, string Contact,
    string PaymentInstructions, bool VatRegistered, string? VatNumber, string NumberPrefix);
public sealed record CommercialOrigin(string Module, string Type, Guid Id);
public sealed record IssueCommercialDocument(Guid IdempotencyKey, Guid CustomerId, CommercialDocumentKind Kind,
    CommercialLine[] Lines, CommercialOrigin? Origin, Guid? AcceptedQuotationId, Guid? PreviousRevisionId, string? Reference);
public sealed record CommercialSnapshot(IssuerSettings Issuer, CrmRecordInput Customer, CommercialTotals Totals, string? Reference);
public sealed record CommercialDocument(Guid Id, Guid OrganisationId, Guid Version, string Number,
    CommercialDocumentKind Kind, Guid CustomerId, CommercialSnapshot Snapshot, DateTimeOffset IssuedAt, Guid ActorId,
    CommercialOrigin? Origin, Guid? QuotationId, Guid? PreviousRevisionId, Guid? CorrectsId,
    bool Accepted, DateTimeOffset? AcceptedAt, string? AcceptanceReference, decimal Credits, decimal Paid, decimal Refunded, decimal Amount);
public sealed record CommercialAction(Guid IdempotencyKey, Guid Version, decimal Amount, string Reason,
    ManualPaymentMethod Method, DateOnly Date, string? Reference);
public sealed record AcceptQuotation(Guid Version, string Reference);
public sealed record PreviewCommercialDocument(CommercialLine[] Lines);
public sealed record FinancialEntry(Guid Id, Guid DocumentId, string Kind, decimal Amount, string Reason,
    ManualPaymentMethod Method, DateOnly Date, string? Reference, Guid ActorId, DateTimeOffset At, Guid? IssuedDocumentId);
public sealed record CommercialDetail(CommercialDocument Document, FinancialEntry[] Entries, CommercialDocument[] Related);
public interface ICommercialDocuments
{
    Task<Result<CommercialDocument[]>> ForOrigin(Guid actor, Guid organisation, CommercialOrigin origin, CancellationToken ct);
    Task<Result<CommercialDocument>> Issue(Guid actor, Guid organisation, IssueCommercialDocument request, CancellationToken ct);
    Task<Result<CommercialDetail>> Read(Guid actor, Guid organisation, Guid id, CancellationToken ct);
    Task<Result<CommercialDocument>> ByOrigin(Guid actor, Guid organisation, CommercialOrigin origin, CancellationToken ct);
}
public interface IInvoicing : ICommercialDocuments
{
    Task<Result<CommercialDocument>> InvoiceAccepted(Guid actor, Guid organisation, Guid quotation, Guid idempotencyKey, CancellationToken ct);
    Task<Result<CommercialTotals>> Preview(Guid actor, Guid organisation, PreviewCommercialDocument request, CancellationToken ct);
    Task<Result<Page<CommercialDocument>>> List(Guid actor, Guid organisation, int page, int size, string search, string sort, string direction, CancellationToken ct);
    Task<Result<IssuerSettings>> Settings(Guid actor, Guid organisation, CancellationToken ct);
    Task<Result<IssuerSettings>> Configure(Guid actor, Guid organisation, IssuerSettings request, CancellationToken ct);
    Task<Result<CommercialDocument>> Accept(Guid actor, Guid organisation, Guid id, AcceptQuotation request, CancellationToken ct);
    Task<Result<FinancialEntry>> Settle(Guid actor, Guid organisation, Guid id, CommercialAction request, CancellationToken ct);
    Task<Result<FinancialEntry>> Credit(Guid actor, Guid organisation, Guid id, CommercialAction request, CancellationToken ct);
    Task<Result<FinancialEntry>> Refund(Guid actor, Guid organisation, Guid id, CommercialAction request, CancellationToken ct);
}
