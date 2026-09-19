using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.CommercialBilling;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Payments;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.CommercialBilling;

public sealed partial class CommercialBillingStore
{
    public async Task<Result<PaymentCheckout>> Checkout(Guid actor, CommercialCheckoutRequest request, CancellationToken ct)
    {
        var selected = await Plan(request.PlanId, ct);
        if (selected is null || selected.Value.Plan.Id == "free" || request.Interval is not ("month" or "year") ||
            !PaymentProviders.All.Contains(request.Provider, StringComparer.Ordinal) || request.RequestId == Guid.Empty || request.Seats is < 1 or > 1000)
            return Result<PaymentCheckout>.Fail("validation.failed", ErrorKind.Validation);
        var (plan, price) = selected.Value;
        if (!payments.Get(request.Provider).Capabilities.Currencies.Contains(price.Currency, StringComparer.Ordinal) ||
            !payments.Get(request.Provider).Capabilities.RecurringIntervals.Contains(request.Interval, StringComparer.Ordinal))
            return Result<PaymentCheckout>.Fail("commercial-billing.provider_capability", ErrorKind.Conflict);
        PaymentOrderRow order;
        await using (var tx = await db.Database.BeginTransactionAsync(ct))
        {
            await customers.Lock(ct); var account = await customers.Find(actor, ct); var methods = await paymentMethods.Status(ct);
            var enabled = request.Provider == PaymentProviders.Stripe ? methods.StripeEnabled : methods.PayFastEnabled;
            if (account?.CanManage != true || !await capabilities.Enabled(CapabilityIds.CommercialBilling, ct) || !enabled)
                return Result<PaymentCheckout>.Fail("authorization.denied", ErrorKind.Forbidden);
            if (!payments.Get(request.Provider).Ready) return Result<PaymentCheckout>.Fail("payments.not_configured", ErrorKind.Conflict);
            if (plan.Pricing == "PerSeat" && request.Seats < account.Users) return Result<PaymentCheckout>.Fail("commercial-billing.seats", ErrorKind.Conflict);
            PaymentOrderRow? previous = await db.Set<PaymentOrderRow>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == request.RequestId, ct);
            var quantity = plan.Pricing == "PerSeat" ? request.Seats : 1;
            var subscription = await db.Set<SubscriptionRow>().SingleOrDefaultAsync(x => x.CustomerId == CustomerId, ct);
            if (previous is null && subscription?.PaymentOrderId is Guid pendingId && subscription.PaidUntil is null && !subscription.Cancelled)
                previous = await db.Set<PaymentOrderRow>().AsNoTracking().SingleAsync(x => x.Id == pendingId, ct);
            if (previous != null && (previous.CustomerId != CustomerId || previous.PlanId != plan.Id || previous.Provider != request.Provider || previous.Interval != request.Interval || previous.Quantity != quantity))
                return Result<PaymentCheckout>.Fail("commercial-billing.request_conflict", ErrorKind.Conflict);
            if (subscription?.PaymentOrderId != null && subscription.PaymentOrderId != request.RequestId && (!subscription.Cancelled || subscription.PaidUntil > time.GetUtcNow()))
                if (previous?.Id != subscription.PaymentOrderId) return Result<PaymentCheckout>.Fail("commercial-billing.subscription_exists", ErrorKind.Conflict);
            if (previous?.Abandoned == true || previous != null && previous.CreatedAt.AddHours(22) < time.GetUtcNow())
                return Result<PaymentCheckout>.Fail("commercial-billing.checkout_expired", ErrorKind.Conflict);
            order = previous ?? new()
            {
                Id = request.RequestId, CustomerId = CustomerId, PlanId = plan.Id, PlanPriceId = price.Id,
                Description = plan.Name, Provider = request.Provider, Interval = request.Interval, Currency = price.Currency,
                UnitMinor = request.Interval == "month" ? price.MonthlyMinor : price.YearlyMinor,
                Quantity = quantity, CreatedAt = time.GetUtcNow()
            };
            if (previous is null)
            {
                db.Add(order);
                if (subscription is null) { subscription = new() { CustomerId = CustomerId }; db.Add(subscription); }
                subscription.PaymentOrderId = order.Id; subscription.PlanId = plan.Id; subscription.PlanPriceId = price.Id;
                subscription.Seats = quantity; subscription.NextCheckAt = time.GetUtcNow(); subscription.Cancelled = false; subscription.CancelRequested = false;
                subscription.TrialUntil = null; subscription.PaidUntil = null;
                db.Add(new CommercialBillingInvoiceRow
                {
                    Id = Guid.NewGuid(), CustomerId = CustomerId, PaymentOrderId = order.Id,
                    Number = $"CB-{time.GetUtcNow():yyyyMM}-{order.Id.ToString("N")[..8].ToUpperInvariant()}",
                    Currency = order.Currency, TotalMinor = checked(order.UnitMinor * order.Quantity), IssuedAt = time.GetUtcNow()
                });
                Audit(actor, CustomerId, "commercial-billing.checkout_requested"); await db.SaveChangesAsync(ct);
            }
            await tx.CommitAsync(ct);
        }
        var response = await payments.Get(order.Provider).Checkout(Payment(order), ct);
        if (response.Reference != null)
            await db.Set<PaymentOrderRow>().Where(x => x.Id == order.Id).ExecuteUpdateAsync(x => x.SetProperty(o => o.CheckoutReference, response.Reference), ct);
        return Result<PaymentCheckout>.Success(response);
    }
}
