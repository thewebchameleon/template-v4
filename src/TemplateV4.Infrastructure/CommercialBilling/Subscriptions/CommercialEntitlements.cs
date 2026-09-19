using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.CommercialBilling;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.CommercialBilling;

public sealed class CommercialEntitlements(FrameworkDb db, TimeProvider time) : ICommercialEntitlements
{
    private static Guid CustomerId => TemplateV4.Application.Customers.Organisation.Id;

    public async Task<long?> Limit(string code, CancellationToken ct)
    {
        var entitlement = await db.Set<CommercialEntitlementRow>().AsNoTracking().SingleOrDefaultAsync(x => x.CustomerId == CustomerId && x.Code == code, ct);
        if (entitlement is not null && (entitlement.ValidUntil == null || entitlement.ValidUntil > time.GetUtcNow())) return entitlement.Limit;
        return code == "storage-bytes"
            ? await db.Set<CommercialPlanRow>().Where(x => x.Id == "free").Select(x => (long?)x.StorageBytes).SingleAsync(ct)
            : null;
    }

    public async Task<long> Usage(string code, CancellationToken ct) => code == "storage-bytes"
        ? await db.Files.Where(x => x.PurgedAt == null).SumAsync(x => x.Size, ct)
        : await db.Set<CommercialUsageCounterRow>().Where(x => x.CustomerId == CustomerId && x.Code == code && x.PeriodEnd > time.GetUtcNow()).SumAsync(x => x.Quantity, ct);

    public async Task<bool> CanConsume(string code, long quantity, CancellationToken ct)
    {
        if (quantity < 0) return false;
        var limit = await Limit(code, ct); return limit is null || quantity <= limit.Value - await Usage(code, ct);
    }

    public async Task RecordUsage(string code, long quantity, DateTimeOffset at, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(code) || code.Length > 80 || quantity < 0) throw new ArgumentOutOfRangeException(nameof(quantity));
        var start = new DateTimeOffset(at.Year, at.Month, 1, 0, 0, 0, TimeSpan.Zero); var end = start.AddMonths(1);
        var row = await db.Set<CommercialUsageCounterRow>().SingleOrDefaultAsync(x => x.CustomerId == CustomerId && x.Code == code && x.PeriodStart == start, ct);
        if (row is null) { row = new() { CustomerId = CustomerId, Code = code, PeriodStart = start, PeriodEnd = end, Version = Guid.NewGuid() }; db.Add(row); }
        row.Quantity = checked(row.Quantity + quantity); row.Version = Guid.NewGuid(); await db.SaveChangesAsync(ct);
    }


    public async Task<bool> CanActivateUser(Guid userId, CancellationToken ct)
    {
        var subscription = await db.Set<SubscriptionRow>().AsNoTracking().SingleOrDefaultAsync(x => x.CustomerId == CustomerId, ct);
        if (subscription is null) return true;
        var plan = await db.Set<CommercialPlanRow>().AsNoTracking().SingleAsync(x => x.Id == subscription.PlanId, ct);
        var accessUntil = subscription.TrialUntil ?? subscription.PaidUntil;
        if (plan.Pricing != "PerSeat" || accessUntil <= time.GetUtcNow()) return true;
        var active = await (from profile in db.Profiles
                            join user in db.Users on profile.Id equals user.Id
                            where profile.Id != userId && !profile.Disabled && user.EmailConfirmed &&
                                (user.RegistrationState == "Approved" || user.RegistrationState == "NotRequired")
                            select user.Id).CountAsync(ct);
        return active < subscription.Seats;
    }
}
