
namespace TemplateV4.Application.Billing;

public sealed record BillingSettings(string Ownership, bool StripeEnabled, bool PayFastEnabled, string DefaultProvider, int TrialDays, int GraceDays, Guid Version);
