namespace TemplateV4.Infrastructure.Persistence;

public sealed class CommercialPlanRow
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Pricing { get; set; } = "Flat";
    public long StorageBytes { get; set; }
    public bool Active { get; set; } = true;
}

public sealed class CommercialPlanPriceRow
{
    public Guid Id { get; set; }
    public string PlanId { get; set; } = "";
    public string Currency { get; set; } = "ZAR";
    public long MonthlyMinor { get; set; }
    public long YearlyMinor { get; set; }
    public DateTimeOffset EffectiveFrom { get; set; }
    public DateTimeOffset? SupersededAt { get; set; }
}

public sealed class SubscriptionRow
{
    public Guid CustomerId { get; set; }
    public string PlanId { get; set; } = "free";
    public Guid? PlanPriceId { get; set; }
    public DateTimeOffset? TrialUntil { get; set; }
    public bool TrialUsed { get; set; }
    public DateTimeOffset? PaidUntil { get; set; }
    public Guid? PaymentOrderId { get; set; }
    public bool Cancelled { get; set; }
    public bool CancelRequested { get; set; }
    public int Seats { get; set; } = 1;
    public DateTimeOffset NextCheckAt { get; set; }
}

public sealed class PaymentOrderRow
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string Purpose { get; set; } = "commercial-subscription";
    public string PlanId { get; set; } = "";
    public Guid? PlanPriceId { get; set; }
    public string Description { get; set; } = "";
    public string Provider { get; set; } = "";
    public string Interval { get; set; } = "month";
    public string Currency { get; set; } = "ZAR";
    public long UnitMinor { get; set; }
    public int Quantity { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? ProtectedProviderReference { get; set; }
    public string? CheckoutReference { get; set; }
    public bool Abandoned { get; set; }
}

public sealed class PaymentReceiptRow
{
    public string Provider { get; set; } = "";
    public string Id { get; set; } = "";
    public Guid PaymentOrderId { get; set; }
    public long AmountMinor { get; set; }
    public string Currency { get; set; } = "";
    public DateTimeOffset SettledAt { get; set; }
}

public sealed class ProcessedPaymentEventRow
{
    public string Provider { get; set; } = "";
    public string Id { get; set; } = "";
    public Guid PaymentOrderId { get; set; }
    public DateTimeOffset ProcessedAt { get; set; }
}

public sealed class CommercialBillingInvoiceRow
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid PaymentOrderId { get; set; }
    public string Number { get; set; } = "";
    public string State { get; set; } = "Open";
    public string Currency { get; set; } = "ZAR";
    public long TotalMinor { get; set; }
    public DateTimeOffset IssuedAt { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
    public DateTimeOffset? PeriodStart { get; set; }
    public DateTimeOffset? PeriodEnd { get; set; }
}

public sealed class CommercialEntitlementRow
{
    public Guid CustomerId { get; set; }
    public string Code { get; set; } = "";
    public long Limit { get; set; }
    public DateTimeOffset? ValidUntil { get; set; }
    public Guid? InvoiceId { get; set; }
}

public sealed class CommercialUsageCounterRow
{
    public Guid CustomerId { get; set; }
    public string Code { get; set; } = "";
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
    public long Quantity { get; set; }
    public Guid Version { get; set; }
}

public sealed class BillingSettingsRow
{
    public int Id { get; set; } = 1;
    public int TrialDays { get; set; } = 14;
    public int GraceDays { get; set; } = 7;
    public Guid Version { get; set; }
}
