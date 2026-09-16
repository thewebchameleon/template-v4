using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Billing;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Billing;

public sealed partial class BillingStore
{
    public async Task<BillingSettings> Settings(CancellationToken ct)
    {
        var row = await db.Set<BillingSettingsRow>().AsNoTracking().SingleAsync(ct);
        return new(row.StripeEnabled, row.PayFastEnabled, row.DefaultProvider, row.TrialDays, row.GraceDays, row.Version);
    }
    public async Task<Result<Unit>> SaveSettings(Guid actor, BillingSettings settings, CancellationToken ct)
    {
        if (settings.DefaultProvider is not ("stripe" or "payfast") || settings.TrialDays is < 0 or > 90 || settings.GraceDays is < 0 or > 30 || settings.DefaultProvider == "stripe" && !settings.StripeEnabled || settings.DefaultProvider == "payfast" && !settings.PayFastEnabled) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var changed = await db.Set<BillingSettingsRow>().Where(x => x.Id == 1 && x.Version == settings.Version).ExecuteUpdateAsync(x => x.SetProperty(s => s.StripeEnabled, settings.StripeEnabled).SetProperty(s => s.PayFastEnabled, settings.PayFastEnabled).SetProperty(s => s.DefaultProvider, settings.DefaultProvider).SetProperty(s => s.TrialDays, settings.TrialDays).SetProperty(s => s.GraceDays, settings.GraceDays).SetProperty(s => s.Version, Guid.NewGuid()), ct);
        if (changed == 0) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        Audit(actor, Guid.Empty, "billing.settings_changed"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
