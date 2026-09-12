using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Billing;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Modules;
using TemplateV4.Domain.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Billing;

public sealed class PlanCatalog
{
    public BillingPlan[] Plans { get; }
    public PlanCatalog(IConfiguration config)
    {
        Plans = config.GetSection("Billing:Plans").Get<BillingPlan[]>() ??
        [new("free", "Free", "Flat", "ZAR", 0, 0, 100L * 1024 * 1024), new("standard", "Standard (demo)", "Flat", "ZAR", 9900, 99000, 10L * 1024 * 1024 * 1024), new("team", "Team (demo)", "PerSeat", "ZAR", 4900, 49000, 50L * 1024 * 1024 * 1024)];
        if (Plans.Length is < 2 or > 20 || Plans.Count(x => x.Id == "free" && x.MonthlyMinor == 0 && x.YearlyMinor == 0 && x.Pricing == "Flat") != 1 || Plans.Select(x => x.Id).Distinct().Count() != Plans.Length ||
            Plans.Any(x => string.IsNullOrWhiteSpace(x.Id) || x.Id.Length > 64 || !x.Id.All(c => char.IsAsciiLetterOrDigit(c) || c == '-') || !CustomerRules.ValidName(x.Name) || x.Pricing is not ("Flat" or "PerSeat") || x.Currency is not ("ZAR" or "USD" or "EUR" or "GBP") || x.StorageBytes is < 0 or > 10995116277760 || x.Id != "free" && (x.MonthlyMinor is < 500 or > 100000000 || x.YearlyMinor is < 500 or > 100000000))) throw new InvalidOperationException("Invalid Billing:Plans catalog.");
    }
    public BillingPlan Free => Plans.Single(x => x.Id == "free");
}

public sealed class StorageEntitlements(FrameworkDb db, PlanCatalog plans, ModuleCatalog modules, TimeProvider time) : IStorageEntitlements
{
    public async Task<long?> Quota(Guid customer, CancellationToken ct)
    {
        var sub = await db.Set<SubscriptionRow>().AsNoTracking().SingleOrDefaultAsync(x => x.CustomerId == customer, ct);
        // Existing contracts survive disabling checkout. Unsubscribed legacy personal libraries keep their configured quota.
        if (sub is null && !modules.Enabled("billing")) return null;
        if (sub is null) return null;
        var grace = await db.Set<BillingSettingsRow>().Select(x => x.GraceDays).SingleAsync(ct);
        return CustomerRules.Paid(time.GetUtcNow(), sub.PaidUntil, sub.TrialUntil, grace, sub.Cancelled) ? (plans.Plans.SingleOrDefault(x => x.Id == sub.PlanId) ?? plans.Free).StorageBytes : plans.Free.StorageBytes;
    }
    public async Task<bool> CanAddMember(Guid customer, int memberCount, CancellationToken ct)
    {
        var sub = await db.Set<SubscriptionRow>().AsNoTracking().SingleOrDefaultAsync(x => x.CustomerId == customer, ct);
        if (sub?.OrderId is null) return true;
        var plan = await db.Set<PaymentOrderRow>().Where(x => x.Id == sub.OrderId).Select(x => x.PlanId).SingleAsync(ct);
        return plans.Plans.SingleOrDefault(x => x.Id == plan)?.Pricing != "PerSeat" || memberCount <= sub.Seats;
    }
    public Task<bool> HasObligations(Guid customer, CancellationToken ct) => db.Set<SubscriptionRow>().AnyAsync(x => x.CustomerId == customer && x.OrderId != null && (!x.Cancelled || x.PaidUntil > time.GetUtcNow()), ct);
}

public sealed class BillingStore(FrameworkDb db, ICustomerAccess customers, PlanCatalog plans, StripeSubscriptions stripe, PayFastSubscriptions payfast,
    IDataProtectionProvider protection, TimeProvider time, ModuleCatalog modules, IStorageEntitlements entitlements) : IBilling
{
    private readonly IDataProtector _tokens = protection.CreateProtector("TemplateV4.billing.subscription.v1");
    public ISubscriptionProvider Provider(string id) => id switch { "stripe" => stripe, "payfast" => payfast, _ => throw new PaymentProviderException() };
    public static PaymentOrder Order(PaymentOrderRow row) => new(row.Id, row.CustomerId, row.PlanId, row.Name, row.Interval, row.Currency, row.UnitMinor, row.Quantity, row.CreatedAt, row.CheckoutReference);
    private static bool Allowed(BillingSettings settings, CustomerInfo account) => settings.Ownership == "Both" || settings.Ownership == account.Kind;
    private void Audit(Guid? actor, Guid customer, string action) => db.Audit.Add(new() { ActorId = actor, SubjectId = customer, SubjectType = "customer", Action = action, At = time.GetUtcNow() });
    public async Task<BillingSettings> Settings(CancellationToken ct)
    {
        var row = await db.Set<BillingSettingsRow>().AsNoTracking().SingleAsync(ct);
        return new(row.Ownership, row.StripeEnabled, row.PayFastEnabled, row.DefaultProvider, row.TrialDays, row.GraceDays, row.Version);
    }
    public async Task<Result<Unit>> SaveSettings(Guid actor, BillingSettings settings, CancellationToken ct)
    {
        if (settings.Ownership is not ("Personal" or "Organization" or "Both") || settings.DefaultProvider is not ("stripe" or "payfast") || settings.TrialDays is < 0 or > 90 || settings.GraceDays is < 0 or > 30 || settings.DefaultProvider == "stripe" && !settings.StripeEnabled || settings.DefaultProvider == "payfast" && !settings.PayFastEnabled) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var changed = await db.Set<BillingSettingsRow>().Where(x => x.Id == 1 && x.Version == settings.Version).ExecuteUpdateAsync(x => x.SetProperty(s => s.Ownership, settings.Ownership).SetProperty(s => s.StripeEnabled, settings.StripeEnabled).SetProperty(s => s.PayFastEnabled, settings.PayFastEnabled).SetProperty(s => s.DefaultProvider, settings.DefaultProvider).SetProperty(s => s.TrialDays, settings.TrialDays).SetProperty(s => s.GraceDays, settings.GraceDays).SetProperty(s => s.Version, Guid.NewGuid()), ct);
        if (changed == 0) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        Audit(actor, Guid.Empty, "billing.settings_changed"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<BillingSummary>> Summary(Guid actor, Guid customer, CancellationToken ct)
    {
        var account = await customers.Find(actor, customer, ct); if (account is null) return Result<BillingSummary>.Fail("customers.not_found", ErrorKind.NotFound);
        var settings = await Settings(ct); var sub = await db.Set<SubscriptionRow>().AsNoTracking().SingleOrDefaultAsync(x => x.CustomerId == customer, ct);
        var order = sub?.OrderId is null ? null : await db.Set<PaymentOrderRow>().AsNoTracking().SingleAsync(x => x.Id == sub.OrderId, ct);
        var state = sub is null ? "Free" : sub.CancelRequested ? "CancellationPending" : sub.Cancelled ? "Cancelled" : sub.TrialUntil > time.GetUtcNow() ? "Trial" : sub.PaidUntil > time.GetUtcNow() ? "Active" : sub.PaidUntil?.AddDays(settings.GraceDays) > time.GetUtcNow() ? "Grace" : order != null && sub.PaidUntil == null ? "Pending" : "Free";
        // Expose only readiness booleans; credentials never leave Infrastructure.
        var available = settings with { StripeEnabled = settings.StripeEnabled && stripe.Configured, PayFastEnabled = settings.PayFastEnabled && payfast.Configured };
        return Result<BillingSummary>.Success(new(customer, plans.Plans, available, order?.PlanId ?? sub?.PlanId ?? "free", state, order?.Provider, sub?.TrialUntil, sub?.PaidUntil, sub?.Seats ?? account.Members, await entitlements.Quota(customer, ct) ?? plans.Free.StorageBytes, account.Role == "Owner", modules.Enabled("billing") && Allowed(settings, account), order?.Interval));
    }
    public async Task<Result<Unit>> Trial(Guid actor, Guid customer, StartTrial request, CancellationToken ct)
    {
        var plan = plans.Plans.SingleOrDefault(x => x.Id == request.PlanId && x.Id != "free"); if (plan is null) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await customers.Lock(customer, ct);
        var account = await customers.Find(actor, customer, ct); var settings = await Settings(ct);
        if (account is null || account.Role != "Owner" || !Allowed(settings, account) || !modules.Enabled("billing")) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var sub = await db.Set<SubscriptionRow>().SingleOrDefaultAsync(x => x.CustomerId == customer, ct);
        if (settings.TrialDays == 0 || sub?.TrialUsed == true || sub?.OrderId != null) return Result.Fail("billing.trial_used", ErrorKind.Conflict);
        if (sub is null) { sub = new() { CustomerId = customer }; db.Set<SubscriptionRow>().Add(sub); }
        sub.PlanId = plan.Id; sub.TrialUntil = time.GetUtcNow().AddDays(settings.TrialDays); sub.TrialUsed = true;
        Audit(actor, customer, "billing.trial_started"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<CheckoutResponse>> Checkout(Guid actor, Guid customer, CheckoutRequest request, CancellationToken ct)
    {
        var plan = plans.Plans.SingleOrDefault(x => x.Id == request.PlanId && x.Id != "free");
        if (plan is null || request.Interval is not ("month" or "year") || request.Provider is not ("stripe" or "payfast") || request.RequestId == Guid.Empty || request.Seats is < 1 or > 1000 || request.Provider == "payfast" && plan.Currency != "ZAR") return Result<CheckoutResponse>.Fail("validation.failed", ErrorKind.Validation);
        PaymentOrderRow order;
        await using (var tx = await db.Database.BeginTransactionAsync(ct))
        {
            await customers.Lock(customer, ct); var account = await customers.Find(actor, customer, ct); var settings = await Settings(ct);
            if (account?.Role != "Owner" || !Allowed(settings, account) || !modules.Enabled("billing") || !(request.Provider == "stripe" ? settings.StripeEnabled : settings.PayFastEnabled)) return Result<CheckoutResponse>.Fail("authorization.denied", ErrorKind.Forbidden);
            if (!Provider(request.Provider).Configured) return Result<CheckoutResponse>.Fail("billing.not_configured", ErrorKind.Conflict);
            if (plan.Pricing == "PerSeat" && request.Seats < account.Members) return Result<CheckoutResponse>.Fail("billing.seats", ErrorKind.Conflict);
            var previous = await db.Set<PaymentOrderRow>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == request.RequestId, ct);
            var quantity = plan.Pricing == "PerSeat" ? request.Seats : 1;
            if (previous != null && (previous.CustomerId != customer || previous.PlanId != plan.Id || previous.Provider != request.Provider || previous.Interval != request.Interval || previous.Quantity != quantity)) return Result<CheckoutResponse>.Fail("billing.request_conflict", ErrorKind.Conflict);
            var sub = await db.Set<SubscriptionRow>().SingleOrDefaultAsync(x => x.CustomerId == customer, ct);
            if (sub?.OrderId != null && sub.OrderId != request.RequestId && (!sub.Cancelled || sub.PaidUntil > time.GetUtcNow())) return Result<CheckoutResponse>.Fail("billing.subscription_exists", ErrorKind.Conflict);
            if (previous?.Abandoned == true) return Result<CheckoutResponse>.Fail("billing.checkout_expired", ErrorKind.Conflict);
            if (previous != null && previous.CreatedAt.AddHours(22) < time.GetUtcNow()) return Result<CheckoutResponse>.Fail("billing.checkout_expired", ErrorKind.Conflict);
            order = previous ?? new() { Id = request.RequestId, CustomerId = customer, PlanId = plan.Id, Name = plan.Name, Provider = request.Provider, Interval = request.Interval, Currency = plan.Currency, UnitMinor = request.Interval == "month" ? plan.MonthlyMinor : plan.YearlyMinor, Quantity = quantity, CreatedAt = time.GetUtcNow() };
            if (previous == null)
            {
                db.Set<PaymentOrderRow>().Add(order);
                if (sub is null) { sub = new() { CustomerId = customer }; db.Set<SubscriptionRow>().Add(sub); }
                sub.OrderId = order.Id; sub.Seats = quantity; sub.NextCheckAt = time.GetUtcNow(); sub.Cancelled = false; sub.CancelRequested = false;
                Audit(actor, customer, "billing.checkout_requested"); await db.SaveChangesAsync(ct);
            }
            await tx.CommitAsync(ct);
        }
        var response = await Provider(order.Provider).Checkout(Order(order), ct);
        if (response.Reference != null) await db.Set<PaymentOrderRow>().Where(x => x.Id == order.Id).ExecuteUpdateAsync(x => x.SetProperty(o => o.CheckoutReference, response.Reference), ct);
        return Result<CheckoutResponse>.Success(response);
    }
    public async Task<Result<Unit>> Cancel(Guid actor, Guid customer, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await customers.Lock(customer, ct);
        if (await customers.Find(actor, customer, ct) is not { Role: "Owner" }) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var sub = await db.Set<SubscriptionRow>().SingleOrDefaultAsync(x => x.CustomerId == customer, ct);
        if (sub is null) return Result.Success();
        sub.CancelRequested = sub.OrderId != null; sub.TrialUntil = null; sub.NextCheckAt = time.GetUtcNow();
        if (sub.OrderId is null) sub.Cancelled = true;
        Audit(actor, customer, "billing.cancellation_requested"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task Apply(Guid orderId, string provider, string receiptId, ProviderSubscription snapshot, CancellationToken ct)
    {
        var order = await db.Set<PaymentOrderRow>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == orderId && x.Provider == provider, ct);
        if (order is null || snapshot.AmountMinor != order.UnitMinor * order.Quantity || snapshot.Currency != order.Currency || receiptId.Length > 128) throw new PaymentProviderException();
        if (order.Abandoned || order.ProtectedSubscription != null && _tokens.Unprotect(order.ProtectedSubscription) != snapshot.Id || !await db.Set<SubscriptionRow>().AnyAsync(x => x.CustomerId == order.CustomerId && x.OrderId == order.Id, ct))
        {
            // Old hosted forms must not revive replaced checkouts or continue charging indefinitely.
            await Provider(provider).Cancel(snapshot.Id, ct); return;
        }
        await using var tx = await db.Database.BeginTransactionAsync(ct); await customers.Lock(order.CustomerId, ct);
        if (await db.Set<PaymentReceiptRow>().AnyAsync(x => x.Provider == provider && x.Id == receiptId, ct)) return;
        var sub = await db.Set<SubscriptionRow>().SingleAsync(x => x.CustomerId == order.CustomerId, ct);
        if (sub.OrderId != order.Id) throw new PaymentProviderException();
        var stored = await db.Set<PaymentOrderRow>().SingleAsync(x => x.Id == order.Id, ct);
        if (stored.ProtectedSubscription != null && _tokens.Unprotect(stored.ProtectedSubscription) != snapshot.Id) throw new PaymentProviderException();
        stored.ProtectedSubscription ??= _tokens.Protect(snapshot.Id);
        if (snapshot.PaidUntil != null && (sub.PaidUntil == null || snapshot.PaidUntil > sub.PaidUntil)) { sub.PaidUntil = snapshot.PaidUntil; sub.PlanId = order.PlanId; sub.TrialUntil = null; }
        sub.Cancelled |= snapshot.State is "canceled" or "cancelled";
        sub.NextCheckAt = time.GetUtcNow().AddMinutes(15);
        db.Set<PaymentReceiptRow>().Add(new() { Provider = provider, Id = receiptId, OrderId = order.Id, At = time.GetUtcNow() });
        Audit(null, order.CustomerId, "billing.reconciled"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
    }
    public async Task Reconcile(Guid customer, CancellationToken ct)
    {
        PaymentOrderRow? order; bool cancel;
        await using (var tx = await db.Database.BeginTransactionAsync(ct))
        {
            await customers.Lock(customer, ct);
            var sub = await db.Set<SubscriptionRow>().SingleAsync(x => x.CustomerId == customer, ct);
            if (sub.OrderId is null || sub.NextCheckAt > time.GetUtcNow()) return;
            sub.NextCheckAt = time.GetUtcNow().AddMinutes(5); cancel = sub.CancelRequested;
            order = await db.Set<PaymentOrderRow>().AsNoTracking().SingleAsync(x => x.Id == sub.OrderId, ct);
            await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        }
        var provider = Provider(order.Provider);
        var token = order.ProtectedSubscription is null ? null : _tokens.Unprotect(order.ProtectedSubscription);
        if (order.Provider == "stripe" && order.CheckoutReference is null && order.CreatedAt.AddHours(22) > time.GetUtcNow())
        {
            var checkout = await provider.Checkout(Order(order), ct); order.CheckoutReference = checkout.Reference;
            await db.Set<PaymentOrderRow>().Where(x => x.Id == order.Id).ExecuteUpdateAsync(x => x.SetProperty(o => o.CheckoutReference, checkout.Reference), ct);
        }
        var snapshot = await provider.Fetch(Order(order), token, ct);
        if (snapshot is null)
        {
            if ((cancel || order.CreatedAt.AddHours(24) < time.GetUtcNow()) && (order.Provider == "payfast" || await stripe.ExpireCheckout(Order(order), ct)))
            {
                await using var tx = await db.Database.BeginTransactionAsync(ct); await customers.Lock(customer, ct);
                await db.Set<PaymentOrderRow>().Where(x => x.Id == order.Id && x.ProtectedSubscription == null).ExecuteUpdateAsync(x => x.SetProperty(o => o.Abandoned, true), ct);
                if (await db.Set<PaymentOrderRow>().AnyAsync(x => x.Id == order.Id && x.Abandoned, ct))
                    await db.Set<SubscriptionRow>().Where(x => x.CustomerId == customer && x.OrderId == order.Id).ExecuteUpdateAsync(x => x.SetProperty(s => s.OrderId, (Guid?)null).SetProperty(s => s.CancelRequested, false).SetProperty(s => s.Cancelled, true), ct);
                Audit(null, customer, "billing.checkout_expired"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
            }
            return;
        }
        if (cancel && snapshot.State is not ("canceled" or "cancelled")) { await provider.Cancel(snapshot.Id, ct); snapshot = snapshot with { State = "canceled" }; }
        await Apply(order.Id, order.Provider, "reconcile-" + Guid.NewGuid().ToString("N"), snapshot, ct);
        if (cancel) await db.Set<SubscriptionRow>().Where(x => x.CustomerId == customer).ExecuteUpdateAsync(x => x.SetProperty(s => s.CancelRequested, false), ct);
    }
}
