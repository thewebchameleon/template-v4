using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Licensing;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Updates;

namespace TemplateV4.Infrastructure.Licensing;

public sealed class LicenseStore(FrameworkDb db, LicenseConfiguration configuration, UpdateConfiguration updates, TimeProvider time) : IModuleLicenses
{
    public async Task<LicenseStatus> Read(CancellationToken ct)
    {
        if (!configuration.Configured) return new(false, null, "unconfigured", []);
        var state = await db.Set<LicenseState>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == 1 && x.DeploymentId == configuration.DeploymentId, ct);
        var now = time.GetUtcNow();
        var license = state is null ? null : configuration.Verify(new(state.Payload, state.Signature), now);
        var components = LicensePolicy.Components(updates.Installed);
        return new(true, state?.VerifiedAt, license is null ? "unavailable" : "verified", configuration.RequiredModules.Select(id =>
            LicensePolicy.Evaluate(id, components.FirstOrDefault(x => x.Id == id), license?.Modules.FirstOrDefault(x => x.Id == id), license is not null, now)).ToArray());
    }

    public async Task Record(SignedDeploymentLicense signed, CancellationToken ct)
    {
        var license = configuration.Verify(signed, time.GetUtcNow()) ?? throw new InvalidOperationException("Invalid license response.");
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(7821403902)", ct);
        var state = await db.Set<LicenseState>().SingleOrDefaultAsync(x => x.Id == 1, ct);
        if (state is not null && state.DeploymentId == license.DeploymentId &&
            (state.Revision > license.Revision || state.VerifiedAt > license.IssuedAt)) throw new InvalidOperationException("Stale license response.");
        if (state is null) { state = new(); db.Add(state); }
        state.DeploymentId = license.DeploymentId; state.Revision = license.Revision;
        state.Payload = signed.Payload; state.Signature = signed.Signature; state.VerifiedAt = license.IssuedAt;
        await db.SaveChangesAsync(ct); await transaction.CommitAsync(ct);
    }
}
