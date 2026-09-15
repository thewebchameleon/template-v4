using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Billing;
using TemplateV4.Domain.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Billing;

public sealed class StorageEntitlements(FrameworkDb db, PlanCatalog plans, TimeProvider time) : IStorageEntitlements
{
    public async Task<long?> Quota(Guid customer, CancellationToken ct)
    {
        var sub = await db.Set<SubscriptionRow>().AsNoTracking().SingleOrDefaultAsync(x => x.CustomerId == customer, ct);
        // Existing contracts survive disabling checkout. Unsubscribed legacy personal libraries keep their configured quota.
        if (sub is null) return null;
        var grace = await db.Set<BillingSettingsRow>().Select(x => x.GraceDays).SingleAsync(ct);
        return CustomerRules.Paid(time.GetUtcNow(), sub.PaidUntil, sub.TrialUntil, grace, sub.Cancelled) ? (plans.Plans.SingleOrDefault(x => x.Id == sub.PlanId) ?? plans.Free).StorageBytes : plans.Free.StorageBytes;
    }
    public async Task<bool> CanAddMember(Guid customer, int memberCount, CancellationToken ct)
    {
        var sub = await db.Set<SubscriptionRow>().AsNoTracking().SingleOrDefaultAsync(x => x.CustomerId == customer, ct);
        if (sub?.OrderId is null) return true;
        var plan = await db.Set<PaymentOrderRow>().Where(x => x.Id == sub.OrderId).Select(x => x.PlanId).SingleAsync(ct);
        return plans.Plans.SingleOrDefault(x => x.Id == plan)?.Pricing != "PerSeat" || memberCount <= sub.Seats;
    }
    public Task<bool> HasObligations(Guid customer, CancellationToken ct) => db.Set<SubscriptionRow>().AnyAsync(x => x.CustomerId == customer && x.OrderId != null && (!x.Cancelled || x.PaidUntil > time.GetUtcNow()), ct);
}
