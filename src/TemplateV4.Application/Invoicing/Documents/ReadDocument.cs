using TemplateV4.Application.Crm;
using TemplateV4.Domain.Invoicing;

namespace TemplateV4.Application.Invoicing;

public sealed record CommercialSnapshot(IssuerSettings Issuer, CrmRecordInput Customer, CommercialTotals Totals, string? Reference);
public sealed record CommercialDocument(Guid Id, Guid OrganisationId, Guid Version, string Number,
    CommercialDocumentKind Kind, Guid CustomerId, CommercialSnapshot Snapshot, DateTimeOffset IssuedAt, Guid ActorId,
    CommercialOrigin? Origin, Guid? QuotationId, Guid? PreviousRevisionId, Guid? CorrectsId,
    bool Accepted, DateTimeOffset? AcceptedAt, string? AcceptanceReference, decimal Credits, decimal Paid, decimal Refunded, decimal Amount);
public sealed record FinancialEntry(Guid Id, Guid DocumentId, string Kind, decimal Amount, string Reason,
    ManualPaymentMethod Method, DateOnly Date, string? Reference, Guid ActorId, DateTimeOffset At, Guid? IssuedDocumentId);
public sealed record CommercialDetail(CommercialDocument Document, FinancialEntry[] Entries, CommercialDocument[] Related);
