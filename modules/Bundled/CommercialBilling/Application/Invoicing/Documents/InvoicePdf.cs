namespace TemplateV4.Application.Invoicing;

public sealed record InvoicePdfVersion(int Version, DateTimeOffset CreatedAt, string Reason);
public sealed record InvoicePdfFile(int Version, byte[] Content);
public sealed record EmailInvoicePdf(Guid IdempotencyKey, int Version);
public sealed record InvoicePdfEmailRequested(Guid PdfId) : IIntegrationEvent;
