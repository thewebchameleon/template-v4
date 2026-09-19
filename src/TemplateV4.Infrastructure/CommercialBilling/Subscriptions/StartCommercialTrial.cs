using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.CommercialBilling;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.CommercialBilling;

public sealed partial class CommercialBillingStore
{
    public async Task<Result<Unit>> Trial(Guid actor, StartCommercialTrial request, CancellationToken ct)
    {
        var plan = await Plan(request.PlanId, ct);
        if (plan is null || plan.Value.Plan.Id == "free") return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await customers.Lock(ct);
        var account = await customers.Find(actor, ct); var settings = await Settings(ct);
        if (account is null || !account.CanManage || !await capabilities.Enabled(CapabilityIds.CommercialBilling, ct)) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var subscription = await db.Set<SubscriptionRow>().SingleOrDefaultAsync(x => x.CustomerId == CustomerId, ct);
        if (settings.TrialDays == 0 || subscription?.TrialUsed == true || subscription?.PaymentOrderId != null) return Result.Fail("commercial-billing.trial_used", ErrorKind.Conflict);
        if (subscription is null) { subscription = new() { CustomerId = CustomerId }; db.Add(subscription); }
        subscription.PlanId = plan.Value.Plan.Id; subscription.PlanPriceId = plan.Value.Price.Id;
        subscription.TrialUntil = time.GetUtcNow().AddDays(settings.TrialDays); subscription.TrialUsed = true;
        subscription.PaidUntil = null; subscription.PaymentOrderId = null; subscription.Cancelled = false; subscription.CancelRequested = false;
        subscription.Seats = Math.Max(1, account.Users);
        await RefreshEntitlement(subscription, null, ct);
        Audit(actor, CustomerId, "commercial-billing.trial_started"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
