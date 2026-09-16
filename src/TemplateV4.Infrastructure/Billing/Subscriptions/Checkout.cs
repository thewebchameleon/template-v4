using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Billing;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Billing;

public sealed partial class BillingStore
{
    public async Task<Result<CheckoutResponse>> Checkout(Guid actor, CheckoutRequest request, CancellationToken ct)
    {
        var customer = TemplateV4.Application.Customers.Organisation.Id;
        var plan = plans.Plans.SingleOrDefault(x => x.Id == request.PlanId && x.Id != "free");
        if (plan is null || request.Interval is not ("month" or "year") || request.Provider is not ("stripe" or "payfast") || request.RequestId == Guid.Empty || request.Seats is < 1 or > 1000 || request.Provider == "payfast" && plan.Currency != "ZAR") return Result<CheckoutResponse>.Fail("validation.failed", ErrorKind.Validation);
        PaymentOrderRow order;
        await using (var tx = await db.Database.BeginTransactionAsync(ct))
        {
            await customers.Lock(ct); var account = await customers.Find(actor, ct); var settings = await Settings(ct);
            if (account?.CanManage != true || !await modules.Enabled(CapabilityIds.Billing, ct) || !(request.Provider == "stripe" ? settings.StripeEnabled : settings.PayFastEnabled)) return Result<CheckoutResponse>.Fail("authorization.denied", ErrorKind.Forbidden);
            if (!Provider(request.Provider).Configured) return Result<CheckoutResponse>.Fail("billing.not_configured", ErrorKind.Conflict);
            if (plan.Pricing == "PerSeat" && request.Seats < account.Users) return Result<CheckoutResponse>.Fail("billing.seats", ErrorKind.Conflict);
            var previous = await db.Set<PaymentOrderRow>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == request.RequestId, ct);
            var quantity = plan.Pricing == "PerSeat" ? request.Seats : 1;
            if (previous != null && (previous.CustomerId != customer || previous.PlanId != plan.Id || previous.Provider != request.Provider || previous.Interval != request.Interval || previous.Quantity != quantity)) return Result<CheckoutResponse>.Fail("billing.request_conflict", ErrorKind.Conflict);
            var sub = await db.Set<SubscriptionRow>().SingleOrDefaultAsync(x => x.CustomerId == customer, ct);
            if (sub?.OrderId != null && sub.OrderId != request.RequestId && (!sub.Cancelled || sub.PaidUntil > time.GetUtcNow())) return Result<CheckoutResponse>.Fail("billing.subscription_exists", ErrorKind.Conflict);
            if (previous?.Abandoned == true) return Result<CheckoutResponse>.Fail("billing.checkout_expired", ErrorKind.Conflict);
            if (previous != null && previous.CreatedAt.AddHours(22) < time.GetUtcNow()) return Result<CheckoutResponse>.Fail("billing.checkout_expired", ErrorKind.Conflict);
            order = previous ?? new() { Id = request.RequestId, CustomerId = customer, PlanId = plan.Id, Name = plan.Name, Provider = request.Provider, Interval = request.Interval, Currency = plan.Currency, UnitMinor = request.Interval == "month" ? plan.MonthlyMinor : plan.YearlyMinor, Quantity = quantity, CreatedAt = time.GetUtcNow() };
            if (previous == null)
            {
                db.Set<PaymentOrderRow>().Add(order);
                if (sub is null) { sub = new() { CustomerId = customer }; db.Set<SubscriptionRow>().Add(sub); }
                sub.OrderId = order.Id; sub.Seats = quantity; sub.NextCheckAt = time.GetUtcNow(); sub.Cancelled = false; sub.CancelRequested = false;
                Audit(actor, customer, "billing.checkout_requested"); await db.SaveChangesAsync(ct);
            }
            await tx.CommitAsync(ct);
        }
        var response = await Provider(order.Provider).Checkout(Order(order), ct);
        if (response.Reference != null) await db.Set<PaymentOrderRow>().Where(x => x.Id == order.Id).ExecuteUpdateAsync(x => x.SetProperty(o => o.CheckoutReference, response.Reference), ct);
        return Result<CheckoutResponse>.Success(response);
    }
}
