using TemplateV4.Domain.Invoicing;

namespace TemplateV4.Application.Invoicing;

public sealed record CommercialAction(Guid IdempotencyKey, Guid Version, decimal Amount, string Reason,
    ManualPaymentMethod Method, DateOnly Date, string? Reference);
