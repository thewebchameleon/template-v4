using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Invoicing;
using TemplateV4.Domain.Invoicing;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed partial class InvoicingStore
{
    public Task<Result<FinancialEntry>> Credit(Guid actor, Guid id, CommercialAction request, CancellationToken ct) => Correct(actor, id, request, "credit", ct);
    public Task<Result<FinancialEntry>> Refund(Guid actor, Guid id, CommercialAction request, CancellationToken ct) => Correct(actor, id, request, "refund", ct);
    private async Task<Result<FinancialEntry>> Correct(Guid actor, Guid id, CommercialAction request, string kind, CancellationToken ct)
    {
        if (request.IdempotencyKey == Guid.Empty || !CommercialRules.ValidAmount(request.Amount) || !Enum.IsDefined(request.Method) ||
            request.Reason is null or { Length: > 1000 } || kind != "payment" && string.IsNullOrWhiteSpace(request.Reason) || request.Reference?.Length > 250 ||
            request.Date == default || request.Date > DateOnly.FromDateTime(time.GetUtcNow().UtcDateTime)) return Result<FinancialEntry>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Session.BeginTransactionAsync(ct); await Lock(ct);
        if (!await access.Allowed(actor, kind == "payment" ? OrganisationOperation.Settle : OrganisationOperation.Correct, ct)) return Result<FinancialEntry>.Fail("customers.not_found", ErrorKind.NotFound);
        var hash = Fingerprint(new { Operation = kind, Document = id, Request = request });
        var retry = await db.Set<CommercialOperationRow>().SingleOrDefaultAsync(x => x.Key == request.IdempotencyKey, ct);
        if (retry != null) return retry.Fingerprint == hash ? Result<FinancialEntry>.Success(Read(await db.Set<FinancialEntryRow>().SingleAsync(x => x.Id == retry.ResultId, ct))) : Result<FinancialEntry>.Fail("idempotency.conflict", ErrorKind.Conflict);
        var row = await Documents().SingleOrDefaultAsync(x => x.Id == id && x.Kind == "Invoice", ct);
        if (row is null) return Result<FinancialEntry>.Fail("resource.not_found", ErrorKind.NotFound);
        if (row.Version != request.Version) return Result<FinancialEntry>.Fail("concurrency.conflict", ErrorKind.Conflict);
        var valid = kind switch
        {
            "payment" => CommercialRules.CanSettle(row.Total, row.Credits, row.Paid, request.Amount),
            "credit" => CommercialRules.CanCredit(row.Total, row.Credits, request.Amount),
            _ => CommercialRules.CanRefund(row.Total, row.Credits, row.Paid, row.Refunded, request.Amount)
        };
        if (!valid) return Result<FinancialEntry>.Fail("invoicing.balance_conflict", ErrorKind.Conflict);
        var entry = new FinancialEntryRow { DocumentId = id, ActorId = actor, Kind = kind, Amount = request.Amount, Reason = request.Reason.Trim(), Method = request.Method.ToString(), Date = request.Date, Reference = request.Reference, At = time.GetUtcNow() };
        var creditedBefore = row.Credits;
        if (kind == "payment") row.Paid += request.Amount;
        else if (kind == "credit") row.Credits += request.Amount;
        else row.Refunded += request.Amount;
        row.Version = Guid.NewGuid();
        if (kind != "refund")
        {
            var settings = await db.Set<IssuerSettingsRow>().SingleAsync(ct);
            var snapshot = Read(row).Snapshot;
            if (kind == "credit") snapshot = snapshot with { Totals = CommercialRules.Credit(snapshot.Totals, creditedBefore, request.Amount) };
            var docKind = kind == "payment" ? CommercialDocumentKind.Receipt : CommercialDocumentKind.CreditNote;
            var correction = new CommercialDocumentRow
            {
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
        db.Set<FinancialEntryRow>().Add(entry); Remember(request.IdempotencyKey, hash, entry.Id); Audit(actor, id, "invoicing." + kind);
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<FinancialEntry>.Success(Read(entry));
    }
}
