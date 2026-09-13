namespace TemplateV4.Application.Billing;

public sealed record BillingPlan(string Id, string Name, string Pricing, string Currency, long MonthlyMinor, long YearlyMinor, long StorageBytes);
public sealed record BillingSettings(string Ownership, bool StripeEnabled, bool PayFastEnabled, string DefaultProvider, int TrialDays, int GraceDays, Guid Version);
public sealed record BillingSummary(Guid CustomerId, BillingPlan[] Plans, BillingSettings Settings, string PlanId, string State, string? Provider,
    DateTimeOffset? TrialUntil, DateTimeOffset? PaidUntil, int Seats, long StorageBytes, bool CanManage, bool CanCheckout, string? Interval, bool CanCancel, string EntitlementState);
public sealed record StartTrial(string PlanId);
public sealed record CheckoutRequest(string PlanId, string Interval, string Provider, int Seats, Guid RequestId);
public sealed record CheckoutResponse(Guid Id, string Url, Dictionary<string, string>? Fields, string? Reference = null);
public interface IStorageEntitlements
{
    Task<long?> Quota(Guid customer, CancellationToken ct);
    Task<bool> CanAddMember(Guid customer, int memberCount, CancellationToken ct);
    Task<bool> HasObligations(Guid customer, CancellationToken ct);
}
public interface IBilling
{
    Task<Result<BillingSummary>> Summary(Guid actor, Guid customer, CancellationToken ct);
    Task<Result<Unit>> Trial(Guid actor, Guid customer, StartTrial request, CancellationToken ct);
    Task<Result<CheckoutResponse>> Checkout(Guid actor, Guid customer, CheckoutRequest request, CancellationToken ct);
    Task<Result<Unit>> Cancel(Guid actor, Guid customer, CancellationToken ct);
    Task<BillingSettings> Settings(CancellationToken ct);
    Task<Result<Unit>> SaveSettings(Guid actor, BillingSettings settings, CancellationToken ct);
}

// Provider execution occurs outside database transactions. Only normalized, authenticated facts cross this boundary.
public sealed record PaymentOrder(Guid Id, Guid CustomerId, string PlanId, string Name, string Interval, string Currency, long UnitMinor, int Quantity, DateTimeOffset CreatedAt, string? CheckoutReference = null);
public sealed record ProviderSubscription(string Id, string State, DateTimeOffset? PaidUntil, long AmountMinor, string Currency);
public interface ISubscriptionProvider
{
    string Id { get; }
    bool Configured { get; }
    Task<CheckoutResponse> Checkout(PaymentOrder order, CancellationToken ct);
    Task<ProviderSubscription?> Fetch(PaymentOrder order, string? subscription, CancellationToken ct);
    Task Cancel(string subscription, CancellationToken ct);
}
