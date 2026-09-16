using Microsoft.AspNetCore.DataProtection;
using TemplateV4.Application.Billing;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Billing;

public sealed partial class BillingStore(FrameworkDb db, ICustomerAccess customers, PlanCatalog plans, StripeSubscriptions stripe, PayFastSubscriptions payfast,
    IDataProtectionProvider protection, TimeProvider time, ICapabilities modules, IStorageEntitlements entitlements) : IBilling
{
    private readonly IDataProtector _tokens = protection.CreateProtector("TemplateV4.billing.subscription.v1");
    public ISubscriptionProvider Provider(string id) => id switch { "stripe" => stripe, "payfast" => payfast, _ => throw new PaymentProviderException() };
    public static PaymentOrder Order(PaymentOrderRow row) => new(row.Id, row.CustomerId, row.PlanId, row.Name, row.Interval, row.Currency, row.UnitMinor, row.Quantity, row.CreatedAt, row.CheckoutReference);
    private void Audit(Guid? actor, Guid customer, string action) => db.Audit.Add(new() { ActorId = actor, SubjectId = customer, SubjectType = "customer", Action = action, At = time.GetUtcNow() });
}
