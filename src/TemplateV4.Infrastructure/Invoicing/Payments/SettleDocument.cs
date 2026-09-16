using TemplateV4.Application.Invoicing;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed partial class InvoicingStore
{
    public Task<Result<FinancialEntry>> Settle(Guid actor, Guid id, CommercialAction request, CancellationToken ct) => Correct(actor, id, request, "payment", ct);
}
