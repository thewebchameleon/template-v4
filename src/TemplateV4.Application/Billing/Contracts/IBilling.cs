
namespace TemplateV4.Application.Billing;

public interface IBilling
{
    Task<Result<BillingSummary>> Summary(Guid actor, CancellationToken ct);
    Task<Result<Unit>> Trial(Guid actor, StartTrial request, CancellationToken ct);
    Task<Result<CheckoutResponse>> Checkout(Guid actor, CheckoutRequest request, CancellationToken ct);
    Task<Result<Unit>> Cancel(Guid actor, CancellationToken ct);
    Task<BillingSettings> Settings(CancellationToken ct);
    Task<Result<Unit>> SaveSettings(Guid actor, BillingSettings settings, CancellationToken ct);
}
