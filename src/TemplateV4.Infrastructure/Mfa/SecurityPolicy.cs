using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class SecurityService
{
    public async Task<Result<Unit>> SetPreferredMethod(Guid id, MfaPreferenceRequest request, CancellationToken ct)
    {
        await using var tx = await db.Session.BeginTransactionAsync(ct); await Lock(id, ct);
        var user = (await users.FindByIdAsync(id.ToString()))!;
        var methods = await ConfiguredMethods(user);
        if (!methods.Contains(request.Method)) return Result.Fail("auth.mfa_method_unavailable", ErrorKind.Validation);
        var previous = user.PreferredMfaMethod;
        user.PreferredMfaMethod = request.Method;
        db.Audit.Add(new() { ActorId = id, SubjectId = id, Action = "auth.mfa_preference_changed", ChangesJson = AuditCapture.Changes(new AuditChange("preferredMfaMethod", previous, request.Method)), At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<SecuritySettings>> SetPolicy(Guid actor, SecurityPolicyRequest request, CancellationToken ct)
    {
        if (request.MfaPolicy is not ("Optional" or "Administrators" or "Everyone")) return Result<SecuritySettings>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Session.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", ct);
        var settings = await db.SecuritySettings.SingleOrDefaultAsync(ct);
        if (settings is not null && settings.Version != request.Version) return Result<SecuritySettings>.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (settings is null)
        {
            if (request.Version != Guid.Empty) return Result<SecuritySettings>.Fail("concurrency.conflict", ErrorKind.Conflict);
            settings = new();
        }
        await Lock(actor, ct);
        if (request.MfaPolicy != settings.MfaPolicy && !await RecentlyVerified(actor, ct)) return Result<SecuritySettings>.Fail("auth.reauthentication_required", ErrorKind.Unauthorized);
        if (db.Entry(settings).State == EntityState.Detached) db.SecuritySettings.Add(settings);
        var previousPolicy = settings.MfaPolicy;
        var previousRegistration = settings.RegistrationEnabled;
        var previousApproval = settings.RegistrationApprovalRequired;
        settings.RegistrationApprovalRequired = request.RegistrationApprovalRequired;
        settings.MfaPolicy = request.MfaPolicy; settings.RegistrationEnabled = request.RegistrationEnabled; settings.Version = Guid.NewGuid();
        db.Audit.Add(new()
        {
            ActorId = actor,
            Action = "security.policy_changed",
            SubjectType = "configuration",
            SubjectNameSnapshot = "security",
            ChangesJson = AuditCapture.Changes(new AuditChange("mfaPolicy", previousPolicy, request.MfaPolicy), new("registrationEnabled", previousRegistration.ToString(), request.RegistrationEnabled.ToString()), new("registrationApprovalRequired", previousApproval.ToString(), request.RegistrationApprovalRequired.ToString())),
            At = time.GetUtcNow()
        });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<SecuritySettings>.Success(settings);
    }
}
