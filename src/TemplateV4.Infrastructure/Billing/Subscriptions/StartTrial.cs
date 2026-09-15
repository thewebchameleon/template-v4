using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Billing;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Billing;

public sealed partial class BillingStore
{
    public async Task<Result<Unit>> Trial(Guid actor, Guid customer, StartTrial request, CancellationToken ct)
    {
        var plan = plans.Plans.SingleOrDefault(x => x.Id == request.PlanId && x.Id != "free"); if (plan is null) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await customers.Lock(customer, ct);
        var account = await customers.Find(actor, customer, ct); var settings = await Settings(ct);
        if (account is null || account.Role != "Owner" || !Allowed(settings, account) || !await modules.Enabled(CapabilityIds.Billing, ct)) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var sub = await db.Set<SubscriptionRow>().SingleOrDefaultAsync(x => x.CustomerId == customer, ct);
        if (settings.TrialDays == 0 || sub?.TrialUsed == true || sub?.OrderId != null) return Result.Fail("billing.trial_used", ErrorKind.Conflict);
        if (sub is null) { sub = new() { CustomerId = customer }; db.Set<SubscriptionRow>().Add(sub); }
        sub.PlanId = plan.Id; sub.TrialUntil = time.GetUtcNow().AddDays(settings.TrialDays); sub.TrialUsed = true;
        Audit(actor, customer, "billing.trial_started"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
