using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.CommercialBilling;
using TemplateV4.Application.Modules;
using TemplateV4.Domain.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.CommercialBilling;

public sealed partial class CommercialBillingStore
{
    public async Task<Result<CommercialBillingSummary>> Summary(Guid actor, CancellationToken ct)
    {
        var account = await customers.Find(actor, ct);
        if (account is null) return Result<CommercialBillingSummary>.Fail("customers.not_found", ErrorKind.NotFound);
        var settings = await Settings(ct);
        var methods = await paymentMethods.Status(ct);
        var plans = await Plans(ct);
        var subscription = await db.Set<SubscriptionRow>().AsNoTracking().SingleOrDefaultAsync(x => x.CustomerId == CustomerId, ct);
        var order = subscription?.PaymentOrderId is null ? null : await db.Set<PaymentOrderRow>().AsNoTracking().SingleAsync(x => x.Id == subscription.PaymentOrderId, ct);
        var state = subscription is null ? "Free" : subscription.CancelRequested ? "CancellationPending" : subscription.Cancelled ? "Cancelled" :
            subscription.TrialUntil > time.GetUtcNow() ? "Trial" : subscription.PaidUntil > time.GetUtcNow() ? "Active" :
            subscription.PaidUntil?.AddDays(settings.GraceDays) > time.GetUtcNow() ? "Grace" :
            order != null && subscription.PaidUntil == null ? "Pending" : order != null ? "PastDue" : "Free";
        var canReadFinancials = await (from membership in db.UserRoles
                                       join claim in db.RoleClaims on membership.RoleId equals claim.RoleId
                                       where membership.UserId == actor && claim.ClaimType == "permission" && claim.ClaimValue == CommercialBillingPermissions.Read
                                       select claim.Id).AnyAsync(ct);
        var invoiceRows = canReadFinancials ? await db.Set<CommercialBillingInvoiceRow>().AsNoTracking().Where(x => x.CustomerId == CustomerId).OrderByDescending(x => x.IssuedAt).Take(50).ToArrayAsync(ct) : [];
        var receiptRows = canReadFinancials ? await (from receipt in db.Set<PaymentReceiptRow>().AsNoTracking()
                                 join payment in db.Set<PaymentOrderRow>().AsNoTracking() on receipt.PaymentOrderId equals payment.Id
                                 where payment.CustomerId == CustomerId
                                 orderby receipt.SettledAt descending
                                 select receipt).Take(50).ToArrayAsync(ct) : [];
        var entitlementRows = await db.Set<CommercialEntitlementRow>().AsNoTracking().Where(x => x.CustomerId == CustomerId).ToArrayAsync(ct);
        var usageRows = await db.Set<CommercialUsageCounterRow>().AsNoTracking().Where(x => x.CustomerId == CustomerId && x.PeriodEnd > time.GetUtcNow()).ToArrayAsync(ct);
        var now = time.GetUtcNow();
        var usagePeriod = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, TimeSpan.Zero);
        var storageUsage = new CommercialUsage("storage-bytes", await entitlements.Usage("storage-bytes", ct), usagePeriod, usagePeriod.AddMonths(1));
        var currentStorage = await entitlements.Limit("storage-bytes", ct) ?? plans.Single(x => x.Plan.Id == "free").Plan.StorageBytes;
        var entitlementsResult = entitlementRows.Where(x => x.ValidUntil == null || x.ValidUntil > time.GetUtcNow())
            .Select(x => new CommercialEntitlement(x.Code, x.Limit, x.ValidUntil)).ToList();
        if (entitlementsResult.All(x => x.Code != "storage-bytes")) entitlementsResult.Add(new("storage-bytes", currentStorage, null));
        return Result<CommercialBillingSummary>.Success(new(
            CustomerId,
            plans.Select(x => new CommercialPlan(x.Plan.Id, x.Plan.Name, x.Plan.Pricing, x.Plan.StorageBytes,
                new(x.Price.Id, x.Price.Currency, x.Price.MonthlyMinor, x.Price.YearlyMinor, x.Price.EffectiveFrom))).ToArray(),
            methods, settings, order?.PlanId ?? subscription?.PlanId ?? "free", state, order?.Provider,
            subscription?.TrialUntil, subscription?.PaidUntil, subscription?.Seats ?? account.Users,
            account.CanManage,
            account.CanManage && await capabilities.Enabled(CapabilityIds.CommercialBilling, ct) &&
                (subscription?.PaymentOrderId == null || subscription.PaidUntil == null && subscription.Cancelled == false || subscription.Cancelled && subscription.PaidUntil <= time.GetUtcNow()),
            order?.Interval,
            account.CanManage && subscription != null && !subscription.CancelRequested && !subscription.Cancelled && (order != null || subscription.TrialUntil > time.GetUtcNow()),
            entitlementsResult.ToArray(),
            usageRows.Where(x => x.Code != "storage-bytes").Select(x => new CommercialUsage(x.Code, x.Quantity, x.PeriodStart, x.PeriodEnd)).Append(storageUsage).ToArray(),
            invoiceRows.Select(x => new CommercialInvoice(x.Id, x.Number, x.State, x.Currency, x.TotalMinor, x.IssuedAt, x.PaidAt, x.PeriodStart, x.PeriodEnd)).ToArray(),
            receiptRows.Select(x => new CommercialPaymentReceipt(x.Provider, x.Id, x.PaymentOrderId, x.AmountMinor, x.Currency, x.SettledAt)).ToArray()));
    }
}
