using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Invoicing;
using TemplateV4.Domain.Invoicing;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed partial class InvoicingStore
{
    public async Task<Result<CommercialDocument>> Issue(Guid actor, Guid organisation, IssueCommercialDocument request, CancellationToken ct)
    {
        if (request.IdempotencyKey == Guid.Empty || !ValidOrigin(request.Origin) || request.Kind is not (CommercialDocumentKind.Quotation or CommercialDocumentKind.Invoice) ||
            request.Reference?.Length > 250 || request.Kind == CommercialDocumentKind.Quotation && request.AcceptedQuotationId.HasValue ||
            request.Kind == CommercialDocumentKind.Invoice && request.PreviousRevisionId.HasValue)
            return Result<CommercialDocument>.Fail("validation.failed", ErrorKind.Validation);
        CommercialTotals totals;
        try { totals = CommercialRules.Price(request.Lines); } catch (ArgumentException) { return Result<CommercialDocument>.Fail("validation.failed", ErrorKind.Validation); }
        if (totals.Total <= 0 || totals.Total > 1000000000000m) return Result<CommercialDocument>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(organisation, ct);
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Issue, ct)) return Result<CommercialDocument>.Fail("customers.not_found", ErrorKind.NotFound);
        var hash = Fingerprint(new { Operation = "issue", Request = request });
        var retry = await db.Set<CommercialOperationRow>().SingleOrDefaultAsync(x => x.OrganisationId == organisation && x.Key == request.IdempotencyKey, ct);
        if (retry != null) return retry.Fingerprint == hash ? Result<CommercialDocument>.Success(Read(await Documents(organisation).SingleAsync(x => x.Id == retry.ResultId, ct))) : Result<CommercialDocument>.Fail("idempotency.conflict", ErrorKind.Conflict);
        if (request.Kind == CommercialDocumentKind.Invoice && request.Origin is { } origin)
        {
            var existing = await Documents(organisation).SingleOrDefaultAsync(x => x.Kind == "Invoice" && x.OriginModule == origin.Module && x.OriginType == origin.Type && x.OriginId == origin.Id, ct);
            if (existing != null) return Result<CommercialDocument>.Success(Read(existing));
        }
        var settings = await db.Set<IssuerSettingsRow>().SingleOrDefaultAsync(x => x.OrganisationId == organisation, ct);
        if (settings is null) return Result<CommercialDocument>.Fail("invoicing.issuer_required", ErrorKind.Conflict);
        var issuer = Read(settings);
        CommercialSnapshot snapshot;
        if (request.AcceptedQuotationId is Guid quoteId)
        {
            var quote = await Documents(organisation).SingleOrDefaultAsync(x => x.Id == quoteId && x.Kind == "Quotation" && x.Accepted, ct);
            if (quote is null || quote.CustomerId != request.CustomerId || Read(quote).Origin != request.Origin) return Result<CommercialDocument>.Fail("invoicing.quotation_invalid", ErrorKind.Conflict);
            if (await Documents(organisation).AnyAsync(x => x.QuotationId == quoteId && x.Kind == "Invoice", ct)) return Result<CommercialDocument>.Fail("invoicing.quotation_invoiced", ErrorKind.Conflict);
            snapshot = Read(quote).Snapshot with { Reference = $"Accepted quotation {quote.Number}. {Read(quote).Snapshot.Reference}" };
            if (Fingerprint(snapshot.Totals.Lines.Select(x => x.Source).ToArray()) != Fingerprint(request.Lines)) return Result<CommercialDocument>.Fail("invoicing.accepted_prices", ErrorKind.Conflict);
        }
        else
        {
            var customer = await crm.Resolve(actor, organisation, request.CustomerId, false, ct);
            if (!customer.IsSuccess) return Result<CommercialDocument>.Fail("resource.not_found", ErrorKind.NotFound);
            if (issuer.VatRegistered && string.IsNullOrWhiteSpace(customer.Value!.Data.Address)) return Result<CommercialDocument>.Fail("invoicing.customer_address", ErrorKind.Validation);
            if (!issuer.VatRegistered && request.Lines.Any(x => x.TaxRate != 0)) return Result<CommercialDocument>.Fail("validation.failed", ErrorKind.Validation);
            snapshot = new(issuer, customer.Value!.Data, totals, request.Reference);
        }
        if (request.PreviousRevisionId is Guid previousId)
        {
            var previous = await Documents(organisation).SingleOrDefaultAsync(x => x.Id == previousId && x.Kind == "Quotation", ct);
            if (previous is null || previous.Accepted || previous.CustomerId != request.CustomerId || Read(previous).Origin != request.Origin ||
                await Documents(organisation).AnyAsync(x => x.PreviousRevisionId == previousId, ct)) return Result<CommercialDocument>.Fail("invoicing.revision_conflict", ErrorKind.Conflict);
        }
        var row = new CommercialDocumentRow
        {
            OrganisationId = organisation,
            ActorId = actor,
            IssuedAt = time.GetUtcNow(),
            Kind = request.Kind.ToString(),
            CustomerId = request.CustomerId,
            CustomerName = snapshot.Customer.Name,
            Snapshot = JsonSerializer.Serialize(snapshot, Json),
            Total = snapshot.Totals.Total,
            Number = Number(settings, issuer, request.Kind),
            OriginModule = request.Origin?.Module,
            OriginType = request.Origin?.Type,
            OriginId = request.Origin?.Id,
            QuotationId = request.AcceptedQuotationId,
            PreviousRevisionId = request.PreviousRevisionId
        };
        db.Set<CommercialDocumentRow>().Add(row); Remember(organisation, request.IdempotencyKey, hash, row.Id); Audit(actor, organisation, row.Id, "invoicing.issued");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<CommercialDocument>.Success(Read(row));
    }
    private static string Number(IssuerSettingsRow settings, IssuerSettings issuer, CommercialDocumentKind kind)
        => $"{issuer.NumberPrefix}-{kind switch { CommercialDocumentKind.Quotation => "Q", CommercialDocumentKind.Invoice => "I", CommercialDocumentKind.Receipt => "R", _ => "C" }}-{settings.NextNumber++:D8}";
}
