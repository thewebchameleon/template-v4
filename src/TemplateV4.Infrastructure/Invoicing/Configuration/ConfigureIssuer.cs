using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Invoicing;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed partial class InvoicingStore
{
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
}
