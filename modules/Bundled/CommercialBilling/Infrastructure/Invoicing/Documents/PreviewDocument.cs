using TemplateV4.Application.Crm;
using TemplateV4.Application.Invoicing;
using TemplateV4.Domain.Invoicing;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed partial class InvoicingStore
{
    public async Task<Result<CommercialTotals>> Preview(Guid actor, PreviewCommercialDocument request, CancellationToken ct)
    {
        if (!await access.Allowed(actor, OrganisationOperation.Read, ct)) return Result<CommercialTotals>.Fail("customers.not_found", ErrorKind.NotFound);
        try { return Result<CommercialTotals>.Success(CommercialRules.Price(request.Lines)); }
        catch (ArgumentException) { return Result<CommercialTotals>.Fail("validation.failed", ErrorKind.Validation); }
    }
}
