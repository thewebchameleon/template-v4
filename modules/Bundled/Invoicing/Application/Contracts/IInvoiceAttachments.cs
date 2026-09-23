namespace TemplateV4.Application.Invoicing;

public interface IInvoiceAttachments
{
    Task<Guid[]> Files(Guid document, CancellationToken ct);
    Task Change(Guid document, Guid file, bool attached, CancellationToken ct);
}
