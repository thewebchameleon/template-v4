using TemplateV4.Domain.Invoicing;

namespace TemplateV4.Application.Invoicing;

public sealed record CommercialOrigin(string Module, string Type, Guid Id);
public sealed record IssueCommercialDocument(Guid IdempotencyKey, Guid CustomerId, CommercialDocumentKind Kind,
    CommercialLine[] Lines, CommercialOrigin? Origin, Guid? AcceptedQuotationId, Guid? PreviousRevisionId, string? Reference);
