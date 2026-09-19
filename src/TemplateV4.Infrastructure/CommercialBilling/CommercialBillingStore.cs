using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.CommercialBilling;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Payments;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.CommercialBilling;

public sealed partial class CommercialBillingStore(
    FrameworkDb db,
    ICustomerAccess customers,
    IPaymentProviderRegistry payments,
    IPaymentMethodConfiguration paymentMethods,
    IDataProtectionProvider protection,
    TimeProvider time,
    ICapabilities capabilities,
    ICommercialEntitlements entitlements) : ICommercialBilling
{
    private readonly IDataProtector _providerReferences = protection.CreateProtector("TemplateV4.commercial-billing.provider-reference.v1");
    private static Guid CustomerId => TemplateV4.Application.Customers.Organisation.Id;

    public static PaymentRequest Payment(PaymentOrderRow row) => new(
        row.Id, row.CustomerId, row.Purpose, row.Description, row.Interval, row.Currency,
        row.UnitMinor, row.Quantity, row.CreatedAt, "/commercial-billing",
        "/api/v1/commercial-billing/callbacks/" + row.Provider, row.CheckoutReference);

    private void Audit(Guid? actor, Guid customer, string action) => db.Audit.Add(new()
    {
        ActorId = actor, SubjectId = customer, SubjectType = "commercial-subscription", Action = action, At = time.GetUtcNow()
    });

    private async Task<(CommercialPlanRow Plan, CommercialPlanPriceRow Price)[]> Plans(CancellationToken ct)
    {
        var rows = await (from plan in db.Set<CommercialPlanRow>().AsNoTracking()
                          join price in db.Set<CommercialPlanPriceRow>().AsNoTracking() on plan.Id equals price.PlanId
                          where plan.Active && price.SupersededAt == null && price.EffectiveFrom <= time.GetUtcNow()
                          orderby plan.Id
                          select new { Plan = plan, Price = price }).ToArrayAsync(ct);
        return rows.Select(x => (x.Plan, x.Price)).ToArray();
    }

    private async Task<(CommercialPlanRow Plan, CommercialPlanPriceRow Price)?> Plan(string id, CancellationToken ct)
    {
        var value = await (from plan in db.Set<CommercialPlanRow>().AsNoTracking()
                           join price in db.Set<CommercialPlanPriceRow>().AsNoTracking() on plan.Id equals price.PlanId
                           where plan.Id == id && plan.Active && price.SupersededAt == null && price.EffectiveFrom <= time.GetUtcNow()
                           select new { Plan = plan, Price = price }).SingleOrDefaultAsync(ct);
        return value is null ? null : (value.Plan, value.Price);
    }

    private async Task RefreshEntitlement(SubscriptionRow subscription, Guid? invoiceId, CancellationToken ct)
    {
        var settings = await db.Set<BillingSettingsRow>().AsNoTracking().SingleAsync(ct);
        var plan = await db.Set<CommercialPlanRow>().AsNoTracking().SingleAsync(x => x.Id == subscription.PlanId, ct);
        var validUntil = subscription.Cancelled || subscription.CancelRequested
            ? subscription.PaidUntil ?? time.GetUtcNow()
            : subscription.TrialUntil ?? subscription.PaidUntil?.AddDays(settings.GraceDays) ?? time.GetUtcNow();
        var entitlement = await db.Set<CommercialEntitlementRow>().SingleOrDefaultAsync(x => x.CustomerId == subscription.CustomerId && x.Code == "storage-bytes", ct);
        if (entitlement is null)
        {
            entitlement = new() { CustomerId = subscription.CustomerId, Code = "storage-bytes" };
            db.Add(entitlement);
        }
        entitlement.Limit = plan.StorageBytes; entitlement.ValidUntil = validUntil; entitlement.InvoiceId = invoiceId;
    }
}
