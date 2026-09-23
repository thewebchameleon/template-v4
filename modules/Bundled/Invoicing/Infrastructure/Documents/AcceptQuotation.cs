using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Invoicing;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed partial class InvoicingStore
{
    public async Task<Result<CommercialDocument>> Accept(Guid actor, Guid id, AcceptQuotation request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Reference) || request.Reference.Length > 1000) return Result<CommercialDocument>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Session.BeginTransactionAsync(ct); await Lock(ct);
        if (!await access.Allowed(actor, OrganisationOperation.Issue, ct)) return Result<CommercialDocument>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = await Documents().SingleOrDefaultAsync(x => x.Id == id && x.Kind == "Quotation", ct);
        if (row is null) return Result<CommercialDocument>.Fail("resource.not_found", ErrorKind.NotFound);
        if (row.Version != request.Version || row.Accepted || await Documents().AnyAsync(x => x.PreviousRevisionId == id, ct)) return Result<CommercialDocument>.Fail("concurrency.conflict", ErrorKind.Conflict);
        row.Accepted = true; row.AcceptedAt = time.GetUtcNow(); row.AcceptedBy = actor; row.AcceptanceReference = request.Reference.Trim(); row.Version = Guid.NewGuid();
        Audit(actor, id, "invoicing.quotation_accepted"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<CommercialDocument>.Success(Read(row));
    }
}
