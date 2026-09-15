using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Invoicing;
using TemplateV4.Domain.Invoicing;
using TemplateV4.Infrastructure.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed partial class InvoicingStore(FrameworkDb db, IOrganisationOperations access, ICustomerAccess organisations, ICrmCustomers crm, TimeProvider time) : IInvoicing
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
    public async Task<Result<CommercialDetail>> Read(Guid actor, Guid organisation, Guid id, CancellationToken ct)
    {
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<CommercialDetail>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = await Documents(organisation).AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return Result<CommercialDetail>.Fail("resource.not_found", ErrorKind.NotFound);
        var entries = await db.Set<FinancialEntryRow>().AsNoTracking().Where(x => x.OrganisationId == organisation && (x.DocumentId == id || x.IssuedDocumentId == id)).OrderBy(x => x.At).ThenBy(x => x.Id).ToArrayAsync(ct);
        var related = await Documents(organisation).AsNoTracking().Where(x => x.CorrectsId == id || x.QuotationId == id || x.PreviousRevisionId == id).OrderBy(x => x.IssuedAt).ThenBy(x => x.Id).ToArrayAsync(ct);
        return Result<CommercialDetail>.Success(new(Read(row), entries.Select(Read).ToArray(), related.Select(Read).ToArray()));
    }
}
