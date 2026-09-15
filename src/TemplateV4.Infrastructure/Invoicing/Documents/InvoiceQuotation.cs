using TemplateV4.Application.Invoicing;
using TemplateV4.Domain.Invoicing;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed partial class InvoicingStore
{
    public async Task<Result<CommercialDocument>> InvoiceAccepted(Guid actor, Guid organisation, Guid quotation, Guid idempotencyKey, CancellationToken ct)
    {
        var detail = await Read(actor, organisation, quotation, ct);
        if (!detail.IsSuccess) return Result<CommercialDocument>.Fail("resource.not_found", ErrorKind.NotFound);
        var quote = detail.Value!.Document;
        if (quote.Kind != CommercialDocumentKind.Quotation || !quote.Accepted) return Result<CommercialDocument>.Fail("invoicing.quotation_invalid", ErrorKind.Conflict);
        return await Issue(actor, organisation, new(idempotencyKey, quote.CustomerId, CommercialDocumentKind.Invoice,
            quote.Snapshot.Totals.Lines.Select(x => x.Source).ToArray(), quote.Origin, quote.Id, null, null), ct);
    }
}
