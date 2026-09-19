using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.CommercialBilling;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.CommercialBilling;

public sealed partial class CommercialBillingStore
{
    public async Task<CommercialBillingSettings> Settings(CancellationToken ct)
    {
        var row = await db.Set<BillingSettingsRow>().AsNoTracking().SingleAsync(ct);
        return new(row.TrialDays, row.GraceDays, row.Version);
    }

    public async Task<Result<Unit>> SaveSettings(Guid actor, CommercialBillingSettings settings, CancellationToken ct)
    {
        if (settings.TrialDays is < 0 or > 90 || settings.GraceDays is < 0 or > 30)
            return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var changed = await db.Set<BillingSettingsRow>().Where(x => x.Id == 1 && x.Version == settings.Version)
            .ExecuteUpdateAsync(update => update.SetProperty(x => x.TrialDays, settings.TrialDays)
                .SetProperty(x => x.GraceDays, settings.GraceDays).SetProperty(x => x.Version, Guid.NewGuid()), ct);
        if (changed == 0) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        var subscription = await db.Set<SubscriptionRow>().SingleOrDefaultAsync(ct);
        if (subscription?.PaidUntil is not null && !subscription.Cancelled && !subscription.CancelRequested)
        {
            var entitlement = await db.Set<CommercialEntitlementRow>().SingleOrDefaultAsync(x => x.CustomerId == subscription.CustomerId && x.Code == "storage-bytes", ct);
            if (entitlement is not null && subscription.TrialUntil is null)
                entitlement.ValidUntil = subscription.PaidUntil.Value.AddDays(settings.GraceDays);
        }
        Audit(actor, Guid.Empty, "commercial-billing.settings_changed");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
