using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Billing;

public sealed partial class BillingStore
{
    public async Task<Result<Unit>> Cancel(Guid actor, CancellationToken ct)
    {
        var customer = TemplateV4.Application.Customers.Organisation.Id;
        await using var tx = await db.Database.BeginTransactionAsync(ct); await customers.Lock(ct);
        if (await customers.Find(actor, ct) is not { CanManage: true }) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var sub = await db.Set<SubscriptionRow>().SingleOrDefaultAsync(x => x.CustomerId == customer, ct);
        if (sub is null || sub.Cancelled || sub.CancelRequested) return Result.Success();
        sub.CancelRequested = sub.OrderId != null; sub.TrialUntil = null; sub.NextCheckAt = time.GetUtcNow();
        if (sub.OrderId is null) sub.Cancelled = true;
        Audit(actor, customer, "billing.cancellation_requested"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
