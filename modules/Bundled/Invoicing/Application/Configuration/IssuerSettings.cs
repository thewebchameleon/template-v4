namespace TemplateV4.Application.Invoicing;

public sealed record IssuerSettings(Guid Version, string Name, string Address, string Contact,
    string PaymentInstructions, bool VatRegistered, string? VatNumber, string NumberPrefix);
