using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Billing;
using TemplateV4.Domain.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Billing;

public sealed class StorageEntitlements(FrameworkDb db, PlanCatalog plans, TimeProvider time) : IStorageEntitlements
{
    public async Task<long?> Quota(CancellationToken ct)
    {
        var sub = await db.Set<SubscriptionRow>().AsNoTracking().SingleOrDefaultAsync(x => x.CustomerId == TemplateV4.Application.Customers.Organisation.Id, ct);
        // One deployment subscription supplies entitlements for all users.
        if (sub is null) return null;
        var grace = await db.Set<BillingSettingsRow>().Select(x => x.GraceDays).SingleAsync(ct);
        return CustomerRules.Paid(time.GetUtcNow(), sub.PaidUntil, sub.TrialUntil, grace, sub.Cancelled) ? (plans.Plans.SingleOrDefault(x => x.Id == sub.PlanId) ?? plans.Free).StorageBytes : plans.Free.StorageBytes;
    }
    public async Task<bool> CanStore(long additionalBytes, CancellationToken ct)
    {
        var quota = await Quota(ct);
        if (quota is null) return true;
        var used = await db.Files.Where(x => x.PurgedAt == null).SumAsync(x => x.Size, ct);
        return additionalBytes >= 0 && additionalBytes <= quota.Value - used;
    }
}
