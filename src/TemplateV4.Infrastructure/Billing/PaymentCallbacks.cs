using System.Globalization;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Billing;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Billing;

public sealed class PaymentCallbacks(FrameworkDb db, StripeSubscriptions stripe, PayFastSubscriptions payfast, BillingStore billing)
{
    public async Task<bool> Stripe(string body, string signature, CancellationToken ct)
    {
        var notification = await stripe.Event(body, signature, ct);
        if (notification is null) return false;
        var order = await db.Set<PaymentOrderRow>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == notification.Value.Order && x.Provider == "stripe", ct);
        if (order is null) return false;
        var snapshot = await stripe.Fetch(BillingStore.Order(order), notification.Value.Subscription, ct);
        if (snapshot is null) return false;
        await billing.Apply(order.Id, "stripe", notification.Value.Id, snapshot, ct); return true;
    }
    public async Task<bool> PayFast(Dictionary<string, string> fields, CancellationToken ct)
    {
        if (!await payfast.Verify(fields, ct) || !Guid.TryParse(fields.GetValueOrDefault("m_payment_id"), out var id) || fields.GetValueOrDefault("payment_status") != "COMPLETE" || fields.GetValueOrDefault("pf_payment_id") is not { Length: > 0 and <= 100 } receipt || fields.GetValueOrDefault("token") is not { Length: > 0 and <= 128 } token || !decimal.TryParse(fields.GetValueOrDefault("amount_gross"), NumberStyles.AllowDecimalPoint, CultureInfo.InvariantCulture, out var amount)) return false;
        var order = await db.Set<PaymentOrderRow>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.Provider == "payfast", ct);
        if (order is null || amount * 100 != order.UnitMinor * order.Quantity) return false;
        // The recurring schedule alone does not prove payment. Extend only after a server-validated COMPLETE ITN.
        var snapshot = await payfast.Fetch(BillingStore.Order(order), token, ct);
        if (snapshot is null) return false;
        var until = await payfast.NextPayment(BillingStore.Order(order), token, ct);
        await billing.Apply(order.Id, "payfast", receipt, snapshot with { PaidUntil = until }, ct); return true;
    }
}
