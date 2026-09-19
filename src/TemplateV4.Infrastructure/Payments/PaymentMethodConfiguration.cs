using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Payments;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Payments;

public sealed class PaymentMethodConfiguration(FrameworkDb db, IPaymentProviderRegistry providers, TimeProvider time) : IPaymentMethodConfiguration
{
    public async Task<PaymentMethodStatus> Status(CancellationToken ct)
    {
        var row = await db.Set<PaymentMethodSettingsRow>().AsNoTracking().SingleAsync(ct);
        return new(row.StripeEnabled, providers.Get(PaymentProviders.Stripe).Ready,
            row.PayFastEnabled, providers.Get(PaymentProviders.PayFast).Ready, row.DefaultProvider, row.Version);
    }

    public async Task<Result<Unit>> Save(Guid actor, PaymentMethodSettings settings, CancellationToken ct)
    {
        if (!PaymentProviders.All.Contains(settings.DefaultProvider, StringComparer.Ordinal) ||
            settings.DefaultProvider == PaymentProviders.Stripe && !settings.StripeEnabled ||
            settings.DefaultProvider == PaymentProviders.PayFast && !settings.PayFastEnabled)
            return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var changed = await db.Set<PaymentMethodSettingsRow>().Where(x => x.Id == 1 && x.Version == settings.Version)
            .ExecuteUpdateAsync(update => update
                .SetProperty(x => x.StripeEnabled, settings.StripeEnabled)
                .SetProperty(x => x.PayFastEnabled, settings.PayFastEnabled)
                .SetProperty(x => x.DefaultProvider, settings.DefaultProvider)
                .SetProperty(x => x.Version, Guid.NewGuid()), ct);
        if (changed == 0) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        db.Audit.Add(new() { ActorId = actor, SubjectId = Guid.Empty, SubjectType = "payments", Action = "payments.methods_changed", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
