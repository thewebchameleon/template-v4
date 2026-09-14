using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Invoicing;
using TemplateV4.Application.Users;
using TemplateV4.Domain.Invoicing;
using TemplateV4.Infrastructure.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed class InvoicingStore(FrameworkDb db, IOrganisationOperations access, ICustomerAccess organisations, ICrmCustomers crm, TimeProvider time) : IInvoicing
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private IQueryable<CommercialDocumentRow> Documents(Guid organisation) => db.Set<CommercialDocumentRow>().Where(x => x.OrganisationId == organisation);
    private static CommercialDocument Read(CommercialDocumentRow r) => new(r.Id, r.OrganisationId, r.Version, r.Number, Enum.Parse<CommercialDocumentKind>(r.Kind), r.CustomerId,
        JsonSerializer.Deserialize<CommercialSnapshot>(r.Snapshot, Json)!, r.IssuedAt, r.ActorId,
        r.OriginId is Guid origin ? new(r.OriginModule!, r.OriginType!, origin) : null, r.QuotationId, r.PreviousRevisionId, r.CorrectsId,
        r.Accepted, r.AcceptedAt, r.AcceptanceReference, r.Credits, r.Paid, r.Refunded, r.Total);
    private static FinancialEntry Read(FinancialEntryRow r) => new(r.Id, r.DocumentId, r.Kind, r.Amount, r.Reason, Enum.Parse<ManualPaymentMethod>(r.Method), r.Date, r.Reference, r.ActorId, r.At, r.IssuedDocumentId);
    private static IssuerSettings Read(IssuerSettingsRow r) => JsonSerializer.Deserialize<IssuerSettings>(r.Data, Json)! with { Version = r.Version };
    private async Task Lock(Guid organisation, CancellationToken ct)
    {
        await CustomerAccess.MutationLock(db, ct);
        await organisations.Lock(organisation, ct);
    }
    private void Audit(Guid actor, Guid organisation, Guid id, string action) => db.Audit.Add(new()
    {
        ActorId = actor,
        SubjectId = id,
        SubjectType = "invoicing.document",
        Action = action,
        At = time.GetUtcNow(),
        RelatedEntitiesJson = JsonSerializer.Serialize(new[] { new { Type = "organisation", Id = organisation } }, Json)
    });
    private static string Fingerprint(object value) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(value, Json))));
    private void Remember(Guid organisation, Guid key, string fingerprint, Guid result) => db.Set<CommercialOperationRow>().Add(new() { OrganisationId = organisation, Key = key, Fingerprint = fingerprint, ResultId = result });
    private static bool ValidOrigin(CommercialOrigin? origin) => origin is null || origin.Id != Guid.Empty &&
        origin.Module is { Length: > 0 and <= 100 } && origin.Type is { Length: > 0 and <= 100 } &&
        origin.Module.All(c => char.IsAsciiLetterOrDigit(c) || c == '-') && origin.Type.All(c => char.IsAsciiLetterOrDigit(c) || c == '-');
    public async Task<Result<CommercialTotals>> Preview(Guid actor, Guid organisation, PreviewCommercialDocument request, CancellationToken ct)
    {
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<CommercialTotals>.Fail("customers.not_found", ErrorKind.NotFound);
        try { return Result<CommercialTotals>.Success(CommercialRules.Price(request.Lines)); }
        catch (ArgumentException) { return Result<CommercialTotals>.Fail("validation.failed", ErrorKind.Validation); }
    }
    public async Task<Result<IssuerSettings>> Settings(Guid actor, Guid organisation, CancellationToken ct)
    {
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<IssuerSettings>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = await db.Set<IssuerSettingsRow>().AsNoTracking().SingleOrDefaultAsync(x => x.OrganisationId == organisation, ct);
        return Result<IssuerSettings>.Success(row is null ? new(Guid.Empty, "", "", "", "", false, null, "DOC") : Read(row));
    }
    public async Task<Result<IssuerSettings>> Configure(Guid actor, Guid organisation, IssuerSettings request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 250 || string.IsNullOrWhiteSpace(request.Address) || request.Address.Length > 2000 ||
            request.Contact is null or { Length: > 1000 } || request.PaymentInstructions is null or { Length: > 4000 } || request.VatRegistered &&
            (request.VatNumber is not { Length: 10 } || !request.VatNumber.All(char.IsAsciiDigit) || !request.VatNumber.StartsWith('4')) ||
            request.NumberPrefix is not { Length: > 0 and <= 20 } || !request.NumberPrefix.All(c => char.IsAsciiLetterOrDigit(c) || c == '-'))
            return Result<IssuerSettings>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(organisation, ct);
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Configure, ct)) return Result<IssuerSettings>.Fail("authorization.denied", ErrorKind.Forbidden);
        var row = await db.Set<IssuerSettingsRow>().SingleOrDefaultAsync(x => x.OrganisationId == organisation, ct);
        if ((row?.Version ?? Guid.Empty) != request.Version) return Result<IssuerSettings>.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (row is null) { row = new() { OrganisationId = organisation }; db.Set<IssuerSettingsRow>().Add(row); }
        row.Version = Guid.NewGuid(); row.Data = JsonSerializer.Serialize(request with { Version = row.Version }, Json);
        Audit(actor, organisation, organisation, "invoicing.settings_changed"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<IssuerSettings>.Success(Read(row));
    }
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
    public async Task<Result<CommercialDocument>> InvoiceAccepted(Guid actor, Guid organisation, Guid quotation, Guid idempotencyKey, CancellationToken ct)
    {
        var detail = await Read(actor, organisation, quotation, ct);
        if (!detail.IsSuccess) return Result<CommercialDocument>.Fail("resource.not_found", ErrorKind.NotFound);
        var quote = detail.Value!.Document;
        if (quote.Kind != CommercialDocumentKind.Quotation || !quote.Accepted) return Result<CommercialDocument>.Fail("invoicing.quotation_invalid", ErrorKind.Conflict);
        return await Issue(actor, organisation, new(idempotencyKey, quote.CustomerId, CommercialDocumentKind.Invoice,
            quote.Snapshot.Totals.Lines.Select(x => x.Source).ToArray(), quote.Origin, quote.Id, null, null), ct);
    }
    public async Task<Result<CommercialDocument[]>> ForOrigin(Guid actor, Guid organisation, CommercialOrigin origin, CancellationToken ct)
    {
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<CommercialDocument[]>.Fail("customers.not_found", ErrorKind.NotFound);
        var rows = await Documents(organisation).AsNoTracking().Where(x => x.OriginModule == origin.Module && x.OriginType == origin.Type && x.OriginId == origin.Id).OrderByDescending(x => x.IssuedAt).ThenBy(x => x.Id).ToArrayAsync(ct);
        return Result<CommercialDocument[]>.Success(rows.Select(Read).ToArray());
    }
    public async Task<Result<CommercialDetail>> Read(Guid actor, Guid organisation, Guid id, CancellationToken ct)
    {
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<CommercialDetail>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = await Documents(organisation).AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return Result<CommercialDetail>.Fail("resource.not_found", ErrorKind.NotFound);
        var entries = await db.Set<FinancialEntryRow>().AsNoTracking().Where(x => x.OrganisationId == organisation && (x.DocumentId == id || x.IssuedDocumentId == id)).OrderBy(x => x.At).ThenBy(x => x.Id).ToArrayAsync(ct);
        var related = await Documents(organisation).AsNoTracking().Where(x => x.CorrectsId == id || x.QuotationId == id || x.PreviousRevisionId == id).OrderBy(x => x.IssuedAt).ThenBy(x => x.Id).ToArrayAsync(ct);
        return Result<CommercialDetail>.Success(new(Read(row), entries.Select(Read).ToArray(), related.Select(Read).ToArray()));
    }
    public async Task<Result<CommercialDocument>> ByOrigin(Guid actor, Guid organisation, CommercialOrigin origin, CancellationToken ct)
    {
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<CommercialDocument>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = await Documents(organisation).AsNoTracking().SingleOrDefaultAsync(x => x.Kind == "Invoice" && x.OriginModule == origin.Module && x.OriginType == origin.Type && x.OriginId == origin.Id, ct);
        return row is null ? Result<CommercialDocument>.Fail("resource.not_found", ErrorKind.NotFound) : Result<CommercialDocument>.Success(Read(row));
    }
    public async Task<Result<Page<CommercialDocument>>> List(Guid actor, Guid organisation, int page, int size, string search, string sort, string direction, CancellationToken ct)
    {
        if (page is < 1 or > 10000 || size is < 1 or > 100 || search is null or { Length: > 250 } || sort is not ("number" or "customer" or "kind" or "total" or "issuedAt") || direction is not ("asc" or "desc")) return Result<Page<CommercialDocument>>.Fail("validation.failed", ErrorKind.Validation);
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<Page<CommercialDocument>>.Fail("customers.not_found", ErrorKind.NotFound);
        var term = search.Trim().ToLowerInvariant(); var rows = Documents(organisation).AsNoTracking().Where(x => x.Number.ToLower().Contains(term) || x.CustomerName.ToLower().Contains(term));
        var total = await rows.CountAsync(ct); var asc = direction == "asc";
        var ordered = sort switch
        {
            "number" => asc ? rows.OrderBy(x => x.Number) : rows.OrderByDescending(x => x.Number),
            "customer" => asc ? rows.OrderBy(x => x.CustomerName) : rows.OrderByDescending(x => x.CustomerName),
            "kind" => asc ? rows.OrderBy(x => x.Kind) : rows.OrderByDescending(x => x.Kind),
            "total" => asc ? rows.OrderBy(x => x.Total) : rows.OrderByDescending(x => x.Total),
            _ => asc ? rows.OrderBy(x => x.IssuedAt) : rows.OrderByDescending(x => x.IssuedAt)
        };
        var items = await ordered.ThenBy(x => x.Id).Skip((page - 1) * size).Take(size).ToArrayAsync(ct);
        return Result<Page<CommercialDocument>>.Success(new(items.Select(Read).ToArray(), total, page, size));
    }
    public async Task<Result<CommercialDocument>> Accept(Guid actor, Guid organisation, Guid id, AcceptQuotation request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Reference) || request.Reference.Length > 1000) return Result<CommercialDocument>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(organisation, ct);
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Issue, ct)) return Result<CommercialDocument>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = await Documents(organisation).SingleOrDefaultAsync(x => x.Id == id && x.Kind == "Quotation", ct);
        if (row is null) return Result<CommercialDocument>.Fail("resource.not_found", ErrorKind.NotFound);
        if (row.Version != request.Version || row.Accepted || await Documents(organisation).AnyAsync(x => x.PreviousRevisionId == id, ct)) return Result<CommercialDocument>.Fail("concurrency.conflict", ErrorKind.Conflict);
        row.Accepted = true; row.AcceptedAt = time.GetUtcNow(); row.AcceptedBy = actor; row.AcceptanceReference = request.Reference.Trim(); row.Version = Guid.NewGuid();
        Audit(actor, organisation, id, "invoicing.quotation_accepted"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<CommercialDocument>.Success(Read(row));
    }
    public Task<Result<FinancialEntry>> Settle(Guid actor, Guid organisation, Guid id, CommercialAction request, CancellationToken ct) => Correct(actor, organisation, id, request, "payment", ct);
    public Task<Result<FinancialEntry>> Credit(Guid actor, Guid organisation, Guid id, CommercialAction request, CancellationToken ct) => Correct(actor, organisation, id, request, "credit", ct);
    public Task<Result<FinancialEntry>> Refund(Guid actor, Guid organisation, Guid id, CommercialAction request, CancellationToken ct) => Correct(actor, organisation, id, request, "refund", ct);
    private async Task<Result<FinancialEntry>> Correct(Guid actor, Guid organisation, Guid id, CommercialAction request, string kind, CancellationToken ct)
    {
        if (request.IdempotencyKey == Guid.Empty || !CommercialRules.ValidAmount(request.Amount) || !Enum.IsDefined(request.Method) ||
            request.Reason is null or { Length: > 1000 } || kind != "payment" && string.IsNullOrWhiteSpace(request.Reason) || request.Reference?.Length > 250 ||
            request.Date == default || request.Date > DateOnly.FromDateTime(time.GetUtcNow().UtcDateTime)) return Result<FinancialEntry>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(organisation, ct);
        if (!await access.Allowed(actor, organisation, kind == "payment" ? OrganisationOperation.Settle : OrganisationOperation.Correct, ct)) return Result<FinancialEntry>.Fail("customers.not_found", ErrorKind.NotFound);
        var hash = Fingerprint(new { Operation = kind, Document = id, Request = request });
        var retry = await db.Set<CommercialOperationRow>().SingleOrDefaultAsync(x => x.OrganisationId == organisation && x.Key == request.IdempotencyKey, ct);
        if (retry != null) return retry.Fingerprint == hash ? Result<FinancialEntry>.Success(Read(await db.Set<FinancialEntryRow>().SingleAsync(x => x.OrganisationId == organisation && x.Id == retry.ResultId, ct))) : Result<FinancialEntry>.Fail("idempotency.conflict", ErrorKind.Conflict);
        var row = await Documents(organisation).SingleOrDefaultAsync(x => x.Id == id && x.Kind == "Invoice", ct);
        if (row is null) return Result<FinancialEntry>.Fail("resource.not_found", ErrorKind.NotFound);
        if (row.Version != request.Version) return Result<FinancialEntry>.Fail("concurrency.conflict", ErrorKind.Conflict);
        var valid = kind switch
        {
            "payment" => CommercialRules.CanSettle(row.Total, row.Credits, row.Paid, request.Amount),
            "credit" => CommercialRules.CanCredit(row.Total, row.Credits, request.Amount),
            _ => CommercialRules.CanRefund(row.Total, row.Credits, row.Paid, row.Refunded, request.Amount)
        };
        if (!valid) return Result<FinancialEntry>.Fail("invoicing.balance_conflict", ErrorKind.Conflict);
        var entry = new FinancialEntryRow { OrganisationId = organisation, DocumentId = id, ActorId = actor, Kind = kind, Amount = request.Amount, Reason = request.Reason.Trim(), Method = request.Method.ToString(), Date = request.Date, Reference = request.Reference, At = time.GetUtcNow() };
        var creditedBefore = row.Credits;
        if (kind == "payment") row.Paid += request.Amount;
        else if (kind == "credit") row.Credits += request.Amount;
        else row.Refunded += request.Amount;
        row.Version = Guid.NewGuid();
        if (kind != "refund")
        {
            var settings = await db.Set<IssuerSettingsRow>().SingleAsync(x => x.OrganisationId == organisation, ct);
            var snapshot = Read(row).Snapshot;
            if (kind == "credit") snapshot = snapshot with { Totals = CommercialRules.Credit(snapshot.Totals, creditedBefore, request.Amount) };
            var docKind = kind == "payment" ? CommercialDocumentKind.Receipt : CommercialDocumentKind.CreditNote;
            var correction = new CommercialDocumentRow
            {
                OrganisationId = organisation,
                Kind = docKind.ToString(),
                ActorId = actor,
                CustomerId = row.CustomerId,
                CustomerName = row.CustomerName,
                IssuedAt = time.GetUtcNow(),
                CorrectsId = id,
                Number = Number(settings, Read(settings), docKind),
                Total = request.Amount,
                Snapshot = JsonSerializer.Serialize(snapshot with { Reference = $"{row.Number}: {request.Reason}" }, Json)
            };
            db.Set<CommercialDocumentRow>().Add(correction); entry.IssuedDocumentId = correction.Id;
        }
        db.Set<FinancialEntryRow>().Add(entry); Remember(organisation, request.IdempotencyKey, hash, entry.Id); Audit(actor, organisation, id, "invoicing." + kind);
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<FinancialEntry>.Success(Read(entry));
    }
}
