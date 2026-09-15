
namespace TemplateV4.Application.Billing;

public interface IBilling
{
    Task<Result<BillingSummary>> Summary(Guid actor, Guid customer, CancellationToken ct);
    Task<Result<Unit>> Trial(Guid actor, Guid customer, StartTrial request, CancellationToken ct);
    Task<Result<CheckoutResponse>> Checkout(Guid actor, Guid customer, CheckoutRequest request, CancellationToken ct);
    Task<Result<Unit>> Cancel(Guid actor, Guid customer, CancellationToken ct);
    Task<BillingSettings> Settings(CancellationToken ct);
    Task<Result<Unit>> SaveSettings(Guid actor, BillingSettings settings, CancellationToken ct);
}
