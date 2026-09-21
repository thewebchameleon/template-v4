using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class SecurityService(FrameworkDb db, UserManager<AppUser> users, IDataProtectionProvider protection, TimeProvider time, IEventOutbox outbox, Microsoft.AspNetCore.Http.IHttpContextAccessor http, IConfiguration config)
{
    private readonly IDataProtector protector = protection.CreateProtector("TemplateV4.authentication-challenge.v1");
    public async Task<SecuritySettings> Settings(CancellationToken ct) => await db.SecuritySettings.AsNoTracking().SingleOrDefaultAsync(ct) ?? new() { Version = Guid.Empty };
    public async Task<bool> GloballyRequired(AppUser user, CancellationToken ct)
    {
        var policy = (await Settings(ct)).MfaPolicy;
        return policy == "Everyone" || (policy == "Administrators" &&
            (await users.IsInRoleAsync(user, "Administrator") || await (from m in db.UserRoles
                                                                        join c in db.RoleClaims on m.RoleId equals c.RoleId
                                                                        where m.UserId == user.Id && c.ClaimType == "permission" && (c.ClaimValue == Permissions.Manage || c.ClaimValue == Permissions.Roles || c.ClaimValue == Permissions.Settings || c.ClaimValue == Permissions.Jobs || c.ClaimValue == Permissions.FileStoragePurge || c.ClaimValue == TemplateV4.Application.CommercialBilling.CommercialBillingPermissions.Manage)
                                                                        select c.Id).AnyAsync(ct)));
    }
    public async Task<bool> PasskeyRequired(AppUser user, CancellationToken ct) =>
        config.GetValue("Security:RequireAdministratorPasskey", true) &&
        (await users.IsInRoleAsync(user, "Administrator") || await (from m in db.UserRoles
                                                                    join c in db.RoleClaims on m.RoleId equals c.RoleId
                                                                    where m.UserId == user.Id && c.ClaimType == "permission" && (c.ClaimValue == Permissions.Manage || c.ClaimValue == Permissions.Roles || c.ClaimValue == Permissions.Settings || c.ClaimValue == Permissions.Jobs || c.ClaimValue == Permissions.FileStoragePurge || c.ClaimValue == TemplateV4.Application.CommercialBilling.CommercialBillingPermissions.Manage)
                                                                    select c.Id).AnyAsync(ct));
    public async Task<bool> RecentlyVerified(Guid actor, CancellationToken ct)
    {
        var sid = http.HttpContext?.User.FindFirst("sid")?.Value;
        var user = await users.FindByIdAsync(actor.ToString());
        if (user is null || !Guid.TryParse(sid, out var sessionId)) return false;
        var strong = await PasskeyRequired(user, ct);
        return await db.Sessions.AnyAsync(x => x.Id == sessionId && x.UserId == actor && x.RevokedAt == null && x.ExpiresAt > time.GetUtcNow() &&
            x.MfaVerifiedAt > time.GetUtcNow().AddMinutes(-5) && (!strong || x.PasskeyVerified), ct);
    }
    public async Task<string[]> ConfiguredMethods(AppUser user)
    {
        var methods = new List<string>(3);
        var strong = await PasskeyRequired(user, default);
        if (!strong && user.EmailConfirmed && user.EmailMfaEnabled) methods.Add(MfaMethods.Email);
        if (!strong && user.TwoFactorEnabled) methods.Add(MfaMethods.Authenticator);
        if ((await users.GetPasskeysAsync(user)).Count > 0) methods.Add(MfaMethods.Passkey);
        return [.. methods];
    }
    public static string PreferredMethod(AppUser user, IReadOnlyCollection<string> methods) =>
        methods.Contains(user.PreferredMfaMethod) ? user.PreferredMfaMethod : methods.Contains(MfaMethods.Email) ? MfaMethods.Email : methods.FirstOrDefault() ?? MfaMethods.Email;
    public async Task<bool> Required(AppUser user, CancellationToken ct) =>
        (await ConfiguredMethods(user)).Length > 0 || await PasskeyRequired(user, ct) || await GloballyRequired(user, ct);
    public async Task Lock(Guid id, CancellationToken ct)
    {
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({id.ToString()}, 0))", ct);
    }
    public async Task<bool> VerifyCode(AppUser user, string code, bool recovery, CancellationToken ct)
    {
        await Lock(user.Id, ct); await db.Entry(user).ReloadAsync(ct);
        if (user.RegistrationState is "Pending" or "Rejected" || await users.IsLockedOutAsync(user) || !user.EmailConfirmed || !await db.Profiles.AnyAsync(x => x.Id == user.Id && !x.Disabled, ct)) return false;
        bool valid = false;
        if (user.TwoFactorEnabled && !string.IsNullOrWhiteSpace(code) && code.Length <= 64)
        {
            if (recovery) valid = (await users.RedeemTwoFactorRecoveryCodeAsync(user, code.Trim())).Succeeded;
            else
            {
                // Identity validates RFC 6238; persist the accepted time window to reject replay.
                var normalized = code.Replace(" ", "").Replace("-", "");
                var step = MatchingTotpStep((await users.GetAuthenticatorKeyAsync(user))!, normalized, time.GetUtcNow());
                valid = step > user.LastTotpStep && await users.VerifyTwoFactorTokenAsync(user, TokenOptions.DefaultAuthenticatorProvider, normalized);
                if (valid) user.LastTotpStep = step;
            }
        }
        if (valid)
        {
            await users.ResetAccessFailedCountAsync(user);
            if (Guid.TryParse(http.HttpContext?.User.FindFirst("sid")?.Value, out var currentSession))
                await db.Sessions.Where(x => x.Id == currentSession && x.UserId == user.Id && x.RevokedAt == null && x.ExpiresAt > time.GetUtcNow())
                    .ExecuteUpdateAsync(x => x.SetProperty(v => v.MfaVerifiedAt, time.GetUtcNow()).SetProperty(v => v.MfaVerified, true), ct);
        }
        else await users.AccessFailedAsync(user);
        await db.SaveChangesAsync(ct); return valid;
    }
    public async Task<bool> Proof(AppUser user, SecurityProof proof, CancellationToken ct)
    {
        if (proof is null) return false;
        await Lock(user.Id, ct); await db.Entry(user).ReloadAsync(ct);
        if (user.RegistrationState is "Pending" or "Rejected" || await users.IsLockedOutAsync(user) || string.IsNullOrEmpty(proof.Password) || proof.Password.Length > 1024 || !await users.CheckPasswordAsync(user, proof.Password))
        { await users.AccessFailedAsync(user); return false; }
        if (await PasskeyRequired(user, ct) && (await users.GetPasskeysAsync(user)).Count > 0) return await RecentlyVerified(user.Id, ct);
        if (user.TwoFactorEnabled) return await VerifyCode(user, proof.Code, proof.RecoveryCode, ct);
        if ((await ConfiguredMethods(user)).Length > 0)
        {
            var sid = http.HttpContext?.User.FindFirst("sid")?.Value;
            if (!Guid.TryParse(sid, out var sessionId) || !await db.Sessions.AnyAsync(x => x.Id == sessionId && x.UserId == user.Id && x.MfaVerified && x.MfaVerifiedAt > time.GetUtcNow().AddMinutes(-5), ct)) return false;
        }
        return true;
    }
    public async Task<bool> RequiresRecentVerification(AppUser user, Guid sessionId, CancellationToken ct)
    {
        var strong = await PasskeyRequired(user, ct);
        return (!user.TwoFactorEnabled || strong) && (await ConfiguredMethods(user)).Length > 0 &&
            !await db.Sessions.AnyAsync(x => x.Id == sessionId && x.UserId == user.Id && x.RevokedAt == null && x.ExpiresAt > time.GetUtcNow() && x.MfaVerified &&
                x.MfaVerifiedAt > time.GetUtcNow().AddMinutes(-5) && (!strong || x.PasskeyVerified), ct);
    }
    public async Task Changed(AppUser user, Guid sessionId, string action, CancellationToken ct)
    {
        await users.UpdateSecurityStampAsync(user);
        await db.Sessions.Where(x => x.UserId == user.Id && x.Id != sessionId && x.RevokedAt == null).ExecuteUpdateAsync(x => x.SetProperty(s => s.RevokedAt, time.GetUtcNow()), ct);
        var session = await db.Sessions.SingleAsync(x => x.Id == sessionId && x.UserId == user.Id, ct);
        session.SecurityStamp = user.SecurityStamp!;
        // Credential removal and preference changes are not new factor verifications.
        if (action is "auth.passkey_added" or "auth.mfa_enabled")
        {
            session.MfaVerified = true; session.MfaVerifiedAt = time.GetUtcNow();
            if (action == "auth.passkey_added") session.PasskeyVerified = true;
        }
        session.SetupOnly = !session.MfaVerified || await PasskeyRequired(user, ct) && !session.PasskeyVerified;
        var culture = await db.Profiles.Where(x => x.Id == user.Id).Select(x => x.Culture).SingleAsync(ct);
        if (AccountDelivery.CanReceiveEmail(user))
            outbox.Add(new EmailRequest(user.Id, EmailTemplate.SecurityNotification, culture));
        db.Audit.Add(new() { ActorId = user.Id, SubjectId = user.Id, Action = action, At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct);
    }
}

public sealed record MfaLoginRequest(string ChallengeId, string Code, bool RecoveryCode = false, string Method = MfaMethods.Authenticator);

public sealed record SecurityProof(string Password, string Code = "", bool RecoveryCode = false);

public sealed record MfaEnrollment(string Key, string Uri);

public sealed record MfaConfirmation(string Code);

public sealed record MfaPreferenceRequest(string Method);

public sealed record SecurityPolicyRequest(string MfaPolicy, Guid Version, bool RegistrationEnabled = false, bool RegistrationApprovalRequired = false);

public sealed record ProfileResponse(Guid Id, string Email, bool EmailConfirmed, string Username, string DisplayName, string Culture, string[] Roles, bool MfaEnabled, bool MfaRequired, int RecoveryCodes, PasskeySummary[] Passkeys, bool EmailMfaEnabled, string[] MfaMethods, string PreferredMfaMethod,
    string? FirstName, string? LastName, string? PhoneNumber, string TimeZone, string? AvatarDataUrl, Guid Version, bool PasskeyRequired);

public sealed record PasskeySummary(string Id, string Name, DateTimeOffset CreatedAt, Guid? DeviceId);

public sealed record AuthenticationChallenge(AuthChallenge Row, string State);


public static class MfaMethods
{
    public const string Email = "Email";
    public const string Authenticator = "Authenticator";
    public const string Passkey = "Passkey";
}
