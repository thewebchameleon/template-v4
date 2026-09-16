namespace TemplateV4.Infrastructure.Persistence;

public sealed class SubscriptionRow
{
    public Guid CustomerId { get; set; }
    public string PlanId { get; set; } = "free";
    public DateTimeOffset? TrialUntil { get; set; }
    public bool TrialUsed { get; set; }
    public DateTimeOffset? PaidUntil { get; set; }
    public Guid? OrderId { get; set; }
    public bool Cancelled { get; set; }
    public bool CancelRequested { get; set; }
    public int Seats { get; set; } = 1;
    public DateTimeOffset NextCheckAt { get; set; }
}
public sealed class PaymentOrderRow
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string PlanId { get; set; } = "";
    public string Name { get; set; } = "";
    public string Provider { get; set; } = "";
    public string Interval { get; set; } = "month";
    public string Currency { get; set; } = "ZAR";
    public long UnitMinor { get; set; }
    public int Quantity { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? ProtectedSubscription { get; set; }
    public string? CheckoutReference { get; set; }
    public bool Abandoned { get; set; }
}
public sealed class PaymentReceiptRow
{
    public string Provider { get; set; } = "";
    public string Id { get; set; } = "";
    public Guid OrderId { get; set; }
    public DateTimeOffset At { get; set; }
}
public sealed class BillingSettingsRow
{
    public int Id { get; set; } = 1;
    public bool StripeEnabled { get; set; } = true;
    public bool PayFastEnabled { get; set; } = true;
    public string DefaultProvider { get; set; } = "payfast";
    public int TrialDays { get; set; } = 14;
    public int GraceDays { get; set; } = 7;
    public Guid Version { get; set; }
}
