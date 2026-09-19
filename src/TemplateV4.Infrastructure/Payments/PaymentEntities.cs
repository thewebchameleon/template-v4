namespace TemplateV4.Infrastructure.Persistence;

public sealed class PaymentMethodSettingsRow
{
    public int Id { get; set; } = 1;
    public bool StripeEnabled { get; set; } = true;
    public bool PayFastEnabled { get; set; } = true;
    public string DefaultProvider { get; set; } = "payfast";
    public Guid Version { get; set; }
}
