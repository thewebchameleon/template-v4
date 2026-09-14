using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed class CommercialObligations(FrameworkDb db, TimeProvider time) : IOrganisationObligations
{
    public Task<bool> PreventsClosure(Guid organisation, CancellationToken ct)
    {
        var retainFrom = time.GetUtcNow().AddYears(-5);
        return db.Set<CommercialDocumentRow>().AnyAsync(x => x.OrganisationId == organisation &&
            (x.IssuedAt >= retainFrom || x.Kind == "Invoice" && (x.Total - x.Credits - x.Paid > 0 || x.Paid - (x.Total - x.Credits) - x.Refunded > 0) ||
             x.Kind == "Quotation" && x.Accepted && !db.Set<CommercialDocumentRow>().Any(i => i.OrganisationId == organisation && i.QuotationId == x.Id)), ct);
    }
}
