
namespace TemplateV4.Application.Billing;

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
