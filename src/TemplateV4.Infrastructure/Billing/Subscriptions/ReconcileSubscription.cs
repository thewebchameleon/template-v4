using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Billing;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Billing;

public sealed partial class BillingStore
{
    public async Task Apply(Guid orderId, string provider, string receiptId, ProviderSubscription snapshot, CancellationToken ct, bool reconciliation = false)
    {
        var order = await db.Set<PaymentOrderRow>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == orderId && x.Provider == provider, ct);
        if (order is null || snapshot.AmountMinor != order.UnitMinor * order.Quantity || snapshot.Currency != order.Currency || receiptId.Length > 128) throw new PaymentProviderException();
        if (order.Abandoned || order.ProtectedSubscription != null && _tokens.Unprotect(order.ProtectedSubscription) != snapshot.Id || !await db.Set<SubscriptionRow>().AnyAsync(x => x.CustomerId == order.CustomerId && x.OrderId == order.Id, ct))
        {
            // Old hosted forms must not revive replaced checkouts or continue charging indefinitely.
            await Provider(provider).Cancel(snapshot.Id, ct); return;
        }
        await using var tx = await db.Database.BeginTransactionAsync(ct); await customers.Lock(ct);
        if (!reconciliation && await db.Set<PaymentReceiptRow>().AnyAsync(x => x.Provider == provider && x.Id == receiptId, ct)) return;
        var sub = await db.Set<SubscriptionRow>().SingleAsync(x => x.CustomerId == order.CustomerId, ct);
        if (sub.OrderId != order.Id) throw new PaymentProviderException();
        var stored = await db.Set<PaymentOrderRow>().SingleAsync(x => x.Id == order.Id, ct);
        if (stored.ProtectedSubscription != null && _tokens.Unprotect(stored.ProtectedSubscription) != snapshot.Id) throw new PaymentProviderException();
        var changed = stored.ProtectedSubscription == null || snapshot.PaidUntil > sub.PaidUntil || sub.PaidUntil == null && snapshot.PaidUntil != null || !sub.Cancelled && snapshot.State is "canceled" or "cancelled";
        stored.ProtectedSubscription ??= _tokens.Protect(snapshot.Id);
        if (snapshot.PaidUntil != null && (sub.PaidUntil == null || snapshot.PaidUntil > sub.PaidUntil)) { sub.PaidUntil = snapshot.PaidUntil; sub.PlanId = order.PlanId; sub.TrialUntil = null; }
        sub.Cancelled |= snapshot.State is "canceled" or "cancelled";
        sub.NextCheckAt = sub.Cancelled && (sub.PaidUntil == null || sub.PaidUntil <= time.GetUtcNow()) ? DateTimeOffset.MaxValue : time.GetUtcNow().AddMinutes(15);
        if (sub.Cancelled) sub.CancelRequested = false;
        if (!reconciliation) db.Set<PaymentReceiptRow>().Add(new() { Provider = provider, Id = receiptId, OrderId = order.Id, At = time.GetUtcNow() });
        if (changed) Audit(null, order.CustomerId, "billing.reconciled"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
    }
    public async Task Reconcile(Guid customer, CancellationToken ct)
    {
        PaymentOrderRow? order; bool cancel;
        await using (var tx = await db.Database.BeginTransactionAsync(ct))
        {
            await customers.Lock(ct);
            var sub = await db.Set<SubscriptionRow>().SingleAsync(x => x.CustomerId == customer, ct);
            if (sub.OrderId is null || sub.NextCheckAt > time.GetUtcNow()) return;
            sub.NextCheckAt = time.GetUtcNow().AddMinutes(5); cancel = sub.CancelRequested;
            order = await db.Set<PaymentOrderRow>().AsNoTracking().SingleAsync(x => x.Id == sub.OrderId, ct);
            await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        }
        var provider = Provider(order.Provider);
        var token = order.ProtectedSubscription is null ? null : _tokens.Unprotect(order.ProtectedSubscription);
        if (order.Provider == "stripe" && order.CheckoutReference is null && order.CreatedAt.AddHours(22) > time.GetUtcNow())
        {
            var checkout = await provider.Checkout(Order(order), ct); order.CheckoutReference = checkout.Reference;
            await db.Set<PaymentOrderRow>().Where(x => x.Id == order.Id).ExecuteUpdateAsync(x => x.SetProperty(o => o.CheckoutReference, checkout.Reference), ct);
        }
        var snapshot = await provider.Fetch(Order(order), token, ct);
        if (snapshot is null)
        {
            if ((cancel || order.CreatedAt.AddHours(24) < time.GetUtcNow()) && (order.Provider == "payfast" || await stripe.ExpireCheckout(Order(order), ct)))
            {
                await using var tx = await db.Database.BeginTransactionAsync(ct); await customers.Lock(ct);
                await db.Set<PaymentOrderRow>().Where(x => x.Id == order.Id && x.ProtectedSubscription == null).ExecuteUpdateAsync(x => x.SetProperty(o => o.Abandoned, true), ct);
                if (await db.Set<PaymentOrderRow>().AnyAsync(x => x.Id == order.Id && x.Abandoned, ct))
                    await db.Set<SubscriptionRow>().Where(x => x.CustomerId == customer && x.OrderId == order.Id).ExecuteUpdateAsync(x => x.SetProperty(s => s.OrderId, (Guid?)null).SetProperty(s => s.CancelRequested, false).SetProperty(s => s.Cancelled, true), ct);
                Audit(null, customer, "billing.checkout_expired"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
            }
            return;
        }
        if (cancel && snapshot.State is not ("canceled" or "cancelled")) { await provider.Cancel(snapshot.Id, ct); snapshot = snapshot with { State = "canceled" }; }
        await Apply(order.Id, order.Provider, "", snapshot, ct, reconciliation: true);
    }
}
