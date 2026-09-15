
namespace TemplateV4.Application.Billing;

public sealed record StartTrial(string PlanId);
public sealed record CheckoutRequest(string PlanId, string Interval, string Provider, int Seats, Guid RequestId);
public sealed record CheckoutResponse(Guid Id, string Url, Dictionary<string, string>? Fields, string? Reference = null);
