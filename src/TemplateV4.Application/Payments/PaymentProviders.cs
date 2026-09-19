namespace TemplateV4.Application.Payments;

public sealed record PaymentRequest(
    Guid Id,
    Guid CustomerId,
    string Purpose,
    string Description,
    string Interval,
    string Currency,
    long UnitMinor,
    int Quantity,
    DateTimeOffset CreatedAt,
    string ReturnPath,
    string CallbackPath,
    string? CheckoutReference = null);

public sealed record PaymentCheckout(Guid Id, string Url, Dictionary<string, string>? Fields, string? Reference = null);
public sealed record ProviderPaymentSnapshot(string Id, string State, DateTimeOffset? PaidUntil, long AmountMinor, string Currency);
public sealed record VerifiedPaymentNotification(string Provider, string EventId, Guid PaymentId, string PaymentReference,
    ProviderPaymentSnapshot? Snapshot = null, bool IsSettlement = false, string? SettlementId = null);

public sealed record PaymentProviderCapabilities(string[] Currencies, string[] RecurringIntervals, bool OneTimePayments);

public interface IPaymentProvider
{
    string Id { get; }
    bool Ready { get; }
    PaymentProviderCapabilities Capabilities { get; }
    Task<PaymentCheckout> Checkout(PaymentRequest request, CancellationToken ct);
    Task<ProviderPaymentSnapshot?> Fetch(PaymentRequest request, string? subscription, CancellationToken ct);
    Task Cancel(string subscription, CancellationToken ct);
}

public interface IPaymentCallbackVerifier
{
    string Provider { get; }
    Task<VerifiedPaymentNotification?> Verify(string body, string signature, CancellationToken ct);
}

public interface IPaymentProviderRegistry
{
    IPaymentProvider Get(string provider);
    IPaymentCallbackVerifier Callback(string provider);
    IReadOnlyCollection<IPaymentProvider> All { get; }
}

public sealed class PaymentProviderException : Exception
{
    public PaymentProviderException() : base("payments.provider_unavailable") { }
}
