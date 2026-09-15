
namespace TemplateV4.Application.Billing;

public sealed record BillingPlan(string Id, string Name, string Pricing, string Currency, long MonthlyMinor, long YearlyMinor, long StorageBytes);
public sealed record BillingSummary(Guid CustomerId, BillingPlan[] Plans, BillingSettings Settings, string PlanId, string State, string? Provider,
    DateTimeOffset? TrialUntil, DateTimeOffset? PaidUntil, int Seats, long StorageBytes, bool CanManage, bool CanCheckout, string? Interval, bool CanCancel, string EntitlementState);
