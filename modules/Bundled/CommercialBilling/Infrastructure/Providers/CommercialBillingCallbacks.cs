using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Payments;
using TemplateV4.Infrastructure.Payments;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.CommercialBilling;

public sealed class CommercialBillingCallbacks(CommercialBillingDb db, IPaymentProviderRegistry payments, CommercialBillingStore billing)
{
    public async Task<bool> Receive(string provider, string body, string signature, CancellationToken ct)
    {
        var notification = await payments.Callback(provider).Verify(body, signature, ct);
        if (notification is null) return false;
        var order = await db.Set<PaymentOrderRow>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == notification.PaymentId && x.Provider == provider, ct);
        if (order is null) return false;
        var snapshot = notification.Snapshot;
        if (snapshot is null)
            snapshot = await payments.Get(provider).Fetch(CommercialBillingStore.Payment(order), notification.PaymentReference, ct);
        if (snapshot is null) return false;
        await billing.Apply(order.Id, notification, snapshot, ct); return true;
    }
}
