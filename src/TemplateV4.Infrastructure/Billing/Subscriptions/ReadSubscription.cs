using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Billing;
using TemplateV4.Application.Modules;
using TemplateV4.Domain.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Billing;

public sealed partial class BillingStore
{
    public async Task<Result<BillingSummary>> Summary(Guid actor, CancellationToken ct)
    {
        var customer = TemplateV4.Application.Customers.Organisation.Id;
        var account = await customers.Find(actor, ct); if (account is null) return Result<BillingSummary>.Fail("customers.not_found", ErrorKind.NotFound);
        var settings = await Settings(ct); var sub = await db.Set<SubscriptionRow>().AsNoTracking().SingleOrDefaultAsync(x => x.CustomerId == customer, ct);
        var order = sub?.OrderId is null ? null : await db.Set<PaymentOrderRow>().AsNoTracking().SingleAsync(x => x.Id == sub.OrderId, ct);
        var state = sub is null ? "Free" : sub.CancelRequested ? "CancellationPending" : sub.Cancelled ? "Cancelled" : sub.TrialUntil > time.GetUtcNow() ? "Trial" : sub.PaidUntil > time.GetUtcNow() ? "Active" : sub.PaidUntil?.AddDays(settings.GraceDays) > time.GetUtcNow() ? "Grace" : order != null && sub.PaidUntil == null ? "Pending" : order != null ? "PastDue" : "Free";
        // Expose only readiness booleans; credentials never leave Infrastructure.
        var available = settings with { StripeEnabled = settings.StripeEnabled && stripe.Configured, PayFastEnabled = settings.PayFastEnabled && payfast.Configured };
        return Result<BillingSummary>.Success(new(customer, plans.Plans, available, order?.PlanId ?? sub?.PlanId ?? "free", state, order?.Provider, sub?.TrialUntil, sub?.PaidUntil, sub?.Seats ?? account.Users, await entitlements.Quota(ct) ?? plans.Free.StorageBytes, account.CanManage, account.CanManage && await modules.Enabled(CapabilityIds.Billing, ct) && !(sub?.OrderId != null && (!sub.Cancelled || sub.PaidUntil > time.GetUtcNow())), order?.Interval,
            account.CanManage && sub != null && !sub.CancelRequested && !sub.Cancelled && (order != null || sub.TrialUntil > time.GetUtcNow()),
            sub != null && CustomerRules.Paid(time.GetUtcNow(), sub.PaidUntil, sub.TrialUntil, settings.GraceDays, sub.Cancelled) ? "Paid" : "Free"));
    }
}
