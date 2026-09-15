using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Billing;

public sealed partial class BillingStore
{
    public async Task<Result<Unit>> Cancel(Guid actor, Guid customer, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await customers.Lock(customer, ct);
        if (await customers.Find(actor, customer, ct) is not { Role: "Owner" }) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var sub = await db.Set<SubscriptionRow>().SingleOrDefaultAsync(x => x.CustomerId == customer, ct);
        if (sub is null || sub.Cancelled || sub.CancelRequested) return Result.Success();
        sub.CancelRequested = sub.OrderId != null; sub.TrialUntil = null; sub.NextCheckAt = time.GetUtcNow();
        if (sub.OrderId is null) sub.Cancelled = true;
        Audit(actor, customer, "billing.cancellation_requested"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
