namespace TemplateV4.Application.Payments;

public static class PaymentProviders
{
    public const string Stripe = "stripe";
    public const string PayFast = "payfast";
    public static readonly string[] All = [Stripe, PayFast];
}

public sealed record PaymentMethodSettings(
    bool StripeEnabled,
    bool PayFastEnabled,
    string DefaultProvider,
    Guid Version);

public sealed record PaymentMethodStatus(
    bool StripeEnabled,
    bool StripeReady,
    bool PayFastEnabled,
    bool PayFastReady,
    string DefaultProvider,
    Guid Version);

public interface IPaymentMethodConfiguration
{
    Task<PaymentMethodStatus> Status(CancellationToken ct);
    Task<Result<Unit>> Save(Guid actor, PaymentMethodSettings settings, CancellationToken ct);
}
