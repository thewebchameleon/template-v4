using TemplateV4.Application.Payments;

namespace TemplateV4.Application.CommercialBilling;

public sealed record CommercialBillingSettings(int TrialDays, int GraceDays, Guid Version);
public sealed record CommercialPlanPrice(Guid Id, string Currency, long MonthlyMinor, long YearlyMinor, DateTimeOffset EffectiveFrom);
public sealed record CommercialPlan(string Id, string Name, string Pricing, long StorageBytes, CommercialPlanPrice Price);
public sealed record CommercialInvoice(Guid Id, string Number, string State, string Currency, long TotalMinor, DateTimeOffset IssuedAt, DateTimeOffset? PaidAt, DateTimeOffset? PeriodStart, DateTimeOffset? PeriodEnd);
public sealed record CommercialPaymentReceipt(string Provider, string Id, Guid PaymentOrderId, long AmountMinor, string Currency, DateTimeOffset SettledAt);
public sealed record CommercialEntitlement(string Code, long Limit, DateTimeOffset? ValidUntil);
public sealed record CommercialUsage(string Code, long Quantity, DateTimeOffset PeriodStart, DateTimeOffset PeriodEnd);

public sealed record CommercialBillingSummary(
    Guid CustomerId,
    CommercialPlan[] Plans,
    PaymentMethodStatus PaymentMethods,
    CommercialBillingSettings Settings,
    string PlanId,
    string State,
    string? Provider,
    DateTimeOffset? TrialUntil,
    DateTimeOffset? PaidUntil,
    int Seats,
    bool CanManage,
    bool CanCheckout,
    string? Interval,
    bool CanCancel,
    CommercialEntitlement[] Entitlements,
    CommercialUsage[] Usage,
    CommercialInvoice[] Invoices,
    CommercialPaymentReceipt[] Receipts);

public sealed record StartCommercialTrial(string PlanId);
public sealed record CommercialCheckoutRequest(string PlanId, string Interval, string Provider, int Seats, Guid RequestId);

public interface ICommercialBilling
{
    Task<Result<CommercialBillingSummary>> Summary(Guid actor, CancellationToken ct);
    Task<Result<Unit>> Trial(Guid actor, StartCommercialTrial request, CancellationToken ct);
    Task<Result<PaymentCheckout>> Checkout(Guid actor, CommercialCheckoutRequest request, CancellationToken ct);
    Task<Result<Unit>> Cancel(Guid actor, CancellationToken ct);
    Task<CommercialBillingSettings> Settings(CancellationToken ct);
    Task<Result<Unit>> SaveSettings(Guid actor, CommercialBillingSettings settings, CancellationToken ct);
}

public interface ICommercialEntitlements
{
    Task<long?> Limit(string code, CancellationToken ct);
    Task<long> Usage(string code, CancellationToken ct);
    Task<bool> CanConsume(string code, long quantity, CancellationToken ct);
    Task RecordUsage(string code, long quantity, DateTimeOffset at, CancellationToken ct);
    Task<bool> CanActivateUser(Guid userId, CancellationToken ct);
}

public static class CommercialBillingPermissions
{
    public const string Read = "commercial-billing.read";
    public const string Manage = "commercial-billing.manage";
}
