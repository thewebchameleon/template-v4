using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.CommercialBilling;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.CommercialBilling;

public sealed partial class CommercialBillingStore
{
    public async Task<Result<Unit>> Cancel(Guid actor, CancellationToken ct)
    {
        await using var tx = await db.Session.BeginTransactionAsync(ct); await customers.Lock(ct);
        if (await customers.Find(actor, ct) is not { CanManage: true }) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var subscription = await db.Set<SubscriptionRow>().SingleOrDefaultAsync(x => x.CustomerId == CustomerId, ct);
        if (subscription is null || subscription.Cancelled || subscription.CancelRequested) return Result.Success();
        subscription.CancelRequested = subscription.PaymentOrderId != null; subscription.TrialUntil = null; subscription.NextCheckAt = time.GetUtcNow();
        if (subscription.PaymentOrderId is null) subscription.Cancelled = true;
        await RefreshEntitlement(subscription, null, ct);
        Audit(actor, CustomerId, "commercial-billing.cancellation_requested"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
