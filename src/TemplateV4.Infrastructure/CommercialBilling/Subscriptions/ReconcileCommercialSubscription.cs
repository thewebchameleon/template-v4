using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.DataProtection;
using TemplateV4.Application.Payments;
using TemplateV4.Infrastructure.Payments;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.CommercialBilling;

public sealed partial class CommercialBillingStore
{
    public async Task Apply(Guid paymentId, VerifiedPaymentNotification notification, ProviderPaymentSnapshot snapshot, CancellationToken ct, bool reconciliation = false)
    {
        var order = await db.Set<PaymentOrderRow>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == paymentId && x.Provider == notification.Provider, ct);
        if (order is null || snapshot.AmountMinor != checked(order.UnitMinor * order.Quantity) || snapshot.Currency != order.Currency || notification.EventId.Length > 128)
            throw new PaymentProviderException();
        var reference = snapshot.Id;
        if (order.Abandoned || order.ProtectedProviderReference != null && _providerReferences.Unprotect(order.ProtectedProviderReference) != reference ||
            !await db.Set<SubscriptionRow>().AnyAsync(x => x.CustomerId == order.CustomerId && x.PaymentOrderId == order.Id, ct))
        {
            if (order.Interval != "one-time") await payments.Get(order.Provider).Cancel(reference, ct);
            return;
        }
        await using var tx = await db.Database.BeginTransactionAsync(ct); await customers.Lock(ct);
        if (!reconciliation && await db.Set<ProcessedPaymentEventRow>().AnyAsync(x => x.Provider == notification.Provider && x.Id == notification.EventId, ct)) return;
        var subscription = await db.Set<SubscriptionRow>().SingleAsync(x => x.CustomerId == order.CustomerId, ct);
        if (subscription.PaymentOrderId != order.Id) throw new PaymentProviderException();
        var stored = await db.Set<PaymentOrderRow>().SingleAsync(x => x.Id == order.Id, ct);
        if (stored.ProtectedProviderReference != null && _providerReferences.Unprotect(stored.ProtectedProviderReference) != reference) throw new PaymentProviderException();
        stored.ProtectedProviderReference ??= _providerReferences.Protect(reference);
        var previousPaidUntil = subscription.PaidUntil;
        var paidUntil = snapshot.PaidUntil;
        if (notification.IsSettlement && paidUntil is null)
        {
            var periodStart = subscription.PaidUntil > time.GetUtcNow() ? subscription.PaidUntil.Value : time.GetUtcNow();
            paidUntil = order.Interval == "year" ? periodStart.AddYears(1) : periodStart.AddMonths(1);
        }
        if (paidUntil != null && (subscription.PaidUntil == null || paidUntil > subscription.PaidUntil))
        {
            subscription.PaidUntil = paidUntil; subscription.PlanId = order.PlanId; subscription.PlanPriceId = order.PlanPriceId; subscription.TrialUntil = null;
        }
        subscription.Cancelled |= snapshot.State is "canceled" or "cancelled";
        subscription.NextCheckAt = subscription.Cancelled && (subscription.PaidUntil == null || subscription.PaidUntil <= time.GetUtcNow()) ? DateTimeOffset.MaxValue : time.GetUtcNow().AddMinutes(15);
        if (subscription.Cancelled) subscription.CancelRequested = false;
        CommercialBillingInvoiceRow? invoice = await db.Set<CommercialBillingInvoiceRow>().Where(x => x.PaymentOrderId == order.Id && x.State == "Open").OrderBy(x => x.IssuedAt).FirstOrDefaultAsync(ct);
        if (invoice is null && paidUntil != null && paidUntil > previousPaidUntil)
        {
            invoice = new()
            {
                Id = Guid.NewGuid(), CustomerId = order.CustomerId, PaymentOrderId = order.Id,
                Number = $"CB-{time.GetUtcNow():yyyyMM}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}",
                Currency = order.Currency, TotalMinor = checked(order.UnitMinor * order.Quantity), IssuedAt = time.GetUtcNow(), PeriodStart = previousPaidUntil, PeriodEnd = paidUntil
            };
            db.Add(invoice);
        }
        if (invoice is not null && (paidUntil != null || notification.IsSettlement))
        {
            invoice.State = "Paid"; invoice.PaidAt = time.GetUtcNow(); invoice.PeriodEnd = paidUntil;
        }
        if (!reconciliation)
            db.Add(new ProcessedPaymentEventRow { Provider = notification.Provider, Id = notification.EventId, PaymentOrderId = order.Id, ProcessedAt = time.GetUtcNow() });
        if (notification.IsSettlement && notification.SettlementId is { Length: > 0 and <= 128 } settlementId &&
            !await db.Set<PaymentReceiptRow>().AnyAsync(x => x.Provider == notification.Provider && x.Id == settlementId, ct))
            db.Add(new PaymentReceiptRow { Provider = notification.Provider, Id = settlementId, PaymentOrderId = order.Id, AmountMinor = snapshot.AmountMinor, Currency = snapshot.Currency, SettledAt = time.GetUtcNow() });
        await RefreshEntitlement(subscription, invoice?.Id, ct);
        Audit(null, order.CustomerId, "commercial-billing.reconciled"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
    }

    public async Task Reconcile(Guid customer, CancellationToken ct)
    {
        PaymentOrderRow? order; bool cancel;
        await using (var tx = await db.Database.BeginTransactionAsync(ct))
        {
            await customers.Lock(ct);
            var subscription = await db.Set<SubscriptionRow>().SingleAsync(x => x.CustomerId == customer, ct);
            if (subscription.PaymentOrderId is null || subscription.NextCheckAt > time.GetUtcNow()) return;
            subscription.NextCheckAt = time.GetUtcNow().AddMinutes(5); cancel = subscription.CancelRequested;
            order = await db.Set<PaymentOrderRow>().AsNoTracking().SingleAsync(x => x.Id == subscription.PaymentOrderId, ct);
            await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        }
        var provider = payments.Get(order.Provider);
        var reference = order.ProtectedProviderReference is null ? null : _providerReferences.Unprotect(order.ProtectedProviderReference);
        if (order.Provider == PaymentProviders.Stripe && order.CheckoutReference is null && order.CreatedAt.AddHours(22) > time.GetUtcNow())
        {
            var checkout = await provider.Checkout(Payment(order), ct); order.CheckoutReference = checkout.Reference;
            await db.Set<PaymentOrderRow>().Where(x => x.Id == order.Id).ExecuteUpdateAsync(x => x.SetProperty(o => o.CheckoutReference, checkout.Reference), ct);
        }
        var snapshot = await provider.Fetch(Payment(order), reference, ct);
        if (snapshot is null)
        {
            var expired = cancel || order.CreatedAt.AddHours(24) < time.GetUtcNow();
            if (expired && (order.Provider == PaymentProviders.PayFast || await ((StripePaymentProvider)provider).ExpireCheckout(Payment(order), ct)))
            {
                await using var tx = await db.Database.BeginTransactionAsync(ct); await customers.Lock(ct);
                await db.Set<PaymentOrderRow>().Where(x => x.Id == order.Id && x.ProtectedProviderReference == null).ExecuteUpdateAsync(x => x.SetProperty(o => o.Abandoned, true), ct);
                if (await db.Set<PaymentOrderRow>().AnyAsync(x => x.Id == order.Id && x.Abandoned, ct))
                    await db.Set<SubscriptionRow>().Where(x => x.CustomerId == customer && x.PaymentOrderId == order.Id)
                        .ExecuteUpdateAsync(x => x.SetProperty(s => s.PaymentOrderId, (Guid?)null).SetProperty(s => s.CancelRequested, false).SetProperty(s => s.Cancelled, true), ct);
                await db.Set<CommercialBillingInvoiceRow>().Where(x => x.PaymentOrderId == order.Id && x.State == "Open").ExecuteUpdateAsync(x => x.SetProperty(i => i.State, "Void"), ct);
                Audit(null, customer, "commercial-billing.checkout_expired"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
            }
            return;
        }
        if (cancel && snapshot.State is not ("canceled" or "cancelled")) { await provider.Cancel(snapshot.Id, ct); snapshot = snapshot with { State = "canceled" }; }
        await Apply(order.Id, new(order.Provider, "reconciliation", order.Id, snapshot.Id), snapshot, ct, reconciliation: true);
    }
}
