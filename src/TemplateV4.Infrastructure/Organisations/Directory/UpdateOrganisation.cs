using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Customers;
using TemplateV4.Domain.Customers;
using TemplateV4.Infrastructure.Images;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Customers;

public sealed partial class CustomerStore
{
    public async Task<OrganisationBrand> Branding(CancellationToken ct)
    {
        var row = await db.Set<CustomerRow>().AsNoTracking().SingleAsync(ct);
        return new(row.Name, row.LogoId is null ? null : $"/api/v1/auth/appearance/logos/{row.LogoId}");
    }

    public async Task<OrganisationLogo?> Logo(Guid id, CancellationToken ct) =>
        await db.Set<OrganisationLogoRow>().AsNoTracking().Where(x => x.Id == id)
            .Select(x => new OrganisationLogo(x.Png)).SingleOrDefaultAsync(ct);

    public async Task<Result<CustomerInfo>> Update(Guid actor, UpdateOrganisation request, CancellationToken ct)
    {
        if (!CustomerRules.ValidName(request.Name) || !CustomerRules.ValidWebsite(request.WebsiteUrl) ||
            !CustomerRules.ValidEmail(request.ContactEmail) || !CustomerRules.ValidTimeZone(request.TimeZone) ||
            !CustomerRules.ValidOptionalText(request.Country, 100))
            return Result<CustomerInfo>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(ct);
        var info = await Managed(actor, ct);
        if (info is null) return Result<CustomerInfo>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (info.Version != request.Version) return Result<CustomerInfo>.Fail("concurrency.conflict", ErrorKind.Conflict);
        var version = Guid.NewGuid();
        var changed = await db.Set<CustomerRow>().Where(x => x.Id == Organisation.Id && x.Version == request.Version)
            .ExecuteUpdateAsync(update => update
                .SetProperty(x => x.Name, request.Name.Trim())
                .SetProperty(x => x.WebsiteUrl, Clean(request.WebsiteUrl))
                .SetProperty(x => x.ContactEmail, Clean(request.ContactEmail))
                .SetProperty(x => x.TimeZone, request.TimeZone)
                .SetProperty(x => x.Country, Clean(request.Country))
                .SetProperty(x => x.Version, version), ct);
        if (changed == 0) return Result<CustomerInfo>.Fail("concurrency.conflict", ErrorKind.Conflict);
        Audit(actor, "customer.updated"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return await Home(actor, ct);
    }

    public async Task<Result<CustomerInfo>> UpdateLogo(Guid actor, Guid version, byte[]? content, CancellationToken ct)
    {
        byte[]? png = null;
        if (content is not null && !PngImage.TryNormalize(content, 512, 1048576, out png))
            return Result<CustomerInfo>.Fail("organisation.logo_invalid", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(ct);
        var info = await Managed(actor, ct);
        if (info is null) return Result<CustomerInfo>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (info.Version != version) return Result<CustomerInfo>.Fail("concurrency.conflict", ErrorKind.Conflict);
        OrganisationLogoRow? logo = null;
        if (png is not null) { logo = new() { Png = png }; db.Add(logo); await db.SaveChangesAsync(ct); }
        var next = Guid.NewGuid();
        var changed = await db.Set<CustomerRow>().Where(x => x.Id == Organisation.Id && x.Version == version)
            .ExecuteUpdateAsync(update => update.SetProperty(x => x.LogoId, logo == null ? null : logo.Id).SetProperty(x => x.Version, next), ct);
        if (changed == 0) return Result<CustomerInfo>.Fail("concurrency.conflict", ErrorKind.Conflict);
        Audit(actor, png is null ? "customer.logo_removed" : "customer.logo_changed");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return await Home(actor, ct);
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
