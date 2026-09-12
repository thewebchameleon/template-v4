using TemplateV4.Application.Platform;
using System.Security.Cryptography;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed record MfaLoginRequest(string ChallengeId, string Code, bool RecoveryCode = false, string Method = MfaMethods.Authenticator);
public sealed record SecurityProof(string Password, string Code = "", bool RecoveryCode = false);
public sealed record MfaEnrollment(string Key, string Uri);
public sealed record MfaConfirmation(string Code);
public sealed record MfaPreferenceRequest(string Method);
public sealed record SecurityPolicyRequest(string MfaPolicy, Guid Version, bool RegistrationEnabled = false);
public sealed record ProfileResponse(Guid Id, string Email, string DisplayName, string Culture, string[] Roles, bool MfaEnabled, bool MfaRequired, int RecoveryCodes, PasskeySummary[] Passkeys, bool EmailMfaEnabled, string[] MfaMethods, string PreferredMfaMethod);
public sealed record PasskeySummary(string Id, string Name, DateTimeOffset CreatedAt);
public sealed record AuthenticationChallenge(AuthChallenge Row, string State);

public static class MfaMethods
{
    public const string Email = "Email";
    public const string Authenticator = "Authenticator";
    public const string Passkey = "Passkey";
}

public sealed class SecurityService(FrameworkDb db, UserManager<AppUser> users, IDataProtectionProvider protection, TimeProvider time, IEventOutbox outbox, Microsoft.AspNetCore.Http.IHttpContextAccessor http)
{
    private readonly IDataProtector protector = protection.CreateProtector("TemplateV4.authentication-challenge.v1");
    public async Task<SecuritySettings> Settings(CancellationToken ct) => await db.SecuritySettings.AsNoTracking().SingleOrDefaultAsync(ct) ?? new() { Version = Guid.Empty };
    public async Task<bool> GloballyRequired(AppUser user, CancellationToken ct)
    {
        var policy = (await Settings(ct)).MfaPolicy;
        return policy == "Everyone" || (policy == "Administrators" &&
            (await users.IsInRoleAsync(user, "Administrator") || await (from m in db.UserRoles
                                                                        join c in db.RoleClaims on m.RoleId equals c.RoleId
                                                                        where m.UserId == user.Id && c.ClaimType == "permission" && (c.ClaimValue == Permissions.Manage || c.ClaimValue == Permissions.Roles || c.ClaimValue == Permissions.Settings || c.ClaimValue == Permissions.Jobs)
                                                                        select c.Id).AnyAsync(ct)));
    }
    public async Task<string[]> ConfiguredMethods(AppUser user)
    {
        var methods = new List<string>(3);
        if (user.EmailConfirmed && user.EmailMfaEnabled) methods.Add(MfaMethods.Email);
        if (user.TwoFactorEnabled) methods.Add(MfaMethods.Authenticator);
        if ((await users.GetPasskeysAsync(user)).Count > 0) methods.Add(MfaMethods.Passkey);
        return [.. methods];
    }
    public static string PreferredMethod(AppUser user, IReadOnlyCollection<string> methods) =>
        methods.Contains(user.PreferredMfaMethod) ? user.PreferredMfaMethod : methods.Contains(MfaMethods.Email) ? MfaMethods.Email : methods.FirstOrDefault() ?? MfaMethods.Email;
    public async Task<bool> Required(AppUser user, CancellationToken ct) =>
        (await ConfiguredMethods(user)).Length > 0 || await GloballyRequired(user, ct);
    public async Task Lock(Guid id, CancellationToken ct)
    {
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({id.ToString()}, 0))", ct);
    }
    public async Task<string> Challenge(AppUser? user, string purpose, string state, string? device, CancellationToken ct, TimeSpan? lifetime = null)
    {
        var raw = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        db.AuthChallenges.Add(new() { Id = AuthService.Hash(raw), UserId = user?.Id, SecurityStamp = user?.SecurityStamp ?? "", Purpose = purpose, State = protector.Protect(state), Device = (device ?? "Browser")[..Math.Min(device?.Length ?? 7, 200)], ExpiresAt = time.GetUtcNow().Add(lifetime ?? TimeSpan.FromMinutes(5)) });
        await db.SaveChangesAsync(ct); return raw;
    }
    // Caller owns a transaction. Read and consume lock the row across replicas.
    public async Task<AuthenticationChallenge?> ReadChallenge(string raw, string purpose, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(raw) || raw.Length > 128) return null;
        var hash = AuthService.Hash(raw);
        var row = await db.AuthChallenges.FromSqlInterpolated($"SELECT * FROM identity.auth_challenges WHERE \"Id\" = {hash} FOR UPDATE").SingleOrDefaultAsync(ct);
        if (row is null || row.Purpose != purpose || row.ExpiresAt <= time.GetUtcNow()) return null;
        return new(row, protector.Unprotect(row.State));
    }
    public void SetChallengeState(AuthenticationChallenge challenge, string state) => challenge.Row.State = protector.Protect(state);
    public async Task<AuthenticationChallenge?> Consume(string raw, string purpose, CancellationToken ct)
    {
        var challenge = await ReadChallenge(raw, purpose, ct);
        if (challenge is not null) db.AuthChallenges.Remove(challenge.Row);
        return challenge;
    }
    public async Task<bool> VerifyCode(AppUser user, string code, bool recovery, CancellationToken ct)
    {
        await Lock(user.Id, ct); await db.Entry(user).ReloadAsync(ct);
        if (await users.IsLockedOutAsync(user) || !user.EmailConfirmed || !await db.Profiles.AnyAsync(x => x.Id == user.Id && !x.Disabled, ct)) return false;
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
        if (valid) await users.ResetAccessFailedCountAsync(user); else await users.AccessFailedAsync(user);
        await db.SaveChangesAsync(ct); return valid;
    }
    public async Task<bool> Proof(AppUser user, SecurityProof proof, CancellationToken ct)
    {
        if (proof is null) return false;
        await Lock(user.Id, ct); await db.Entry(user).ReloadAsync(ct);
        if (await users.IsLockedOutAsync(user) || string.IsNullOrEmpty(proof.Password) || proof.Password.Length > 1024 || !await users.CheckPasswordAsync(user, proof.Password))
        { await users.AccessFailedAsync(user); return false; }
        if (user.TwoFactorEnabled) return await VerifyCode(user, proof.Code, proof.RecoveryCode, ct);
        if ((await ConfiguredMethods(user)).Length > 0)
        {
            var sid = http.HttpContext?.User.FindFirst("sid")?.Value;
            if (!Guid.TryParse(sid, out var sessionId) || !await db.Sessions.AnyAsync(x => x.Id == sessionId && x.UserId == user.Id && x.MfaVerified && x.CreatedAt > time.GetUtcNow().AddMinutes(-5), ct)) return false;
        }
        return true;
    }
    public async Task<bool> RequiresRecentVerification(AppUser user, Guid sessionId, CancellationToken ct) =>
        !user.TwoFactorEnabled && (await ConfiguredMethods(user)).Length > 0 &&
        !await db.Sessions.AnyAsync(x => x.Id == sessionId && x.UserId == user.Id && x.MfaVerified && x.CreatedAt > time.GetUtcNow().AddMinutes(-5), ct);
    public async Task<ProfileResponse> Profile(Guid id, CancellationToken ct)
    {
        var user = (await users.FindByIdAsync(id.ToString()))!;
        var profile = await db.Profiles.AsNoTracking().SingleAsync(x => x.Id == id, ct);
        var methods = await ConfiguredMethods(user);
        return new(id, user.Email!, profile.DisplayName, profile.Culture, (await users.GetRolesAsync(user)).ToArray(), user.TwoFactorEnabled, await GloballyRequired(user, ct), await users.CountRecoveryCodesAsync(user),
            (await users.GetPasskeysAsync(user)).Select(x => new PasskeySummary(Microsoft.AspNetCore.WebUtilities.WebEncoders.Base64UrlEncode(x.CredentialId), x.Name ?? "Passkey", x.CreatedAt)).ToArray(), user.EmailMfaEnabled, methods, PreferredMethod(user, methods));
    }
    public async Task<Result<Unit>> SetPreferredMethod(Guid id, MfaPreferenceRequest request, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(id, ct);
        var user = (await users.FindByIdAsync(id.ToString()))!;
        var methods = await ConfiguredMethods(user);
        if (!methods.Contains(request.Method)) return Result.Fail("auth.mfa_method_unavailable", ErrorKind.Validation);
        var previous = user.PreferredMfaMethod;
        user.PreferredMfaMethod = request.Method;
        db.Audit.Add(new() { ActorId = id, SubjectId = id, Action = "auth.mfa_preference_changed", ChangesJson = AuditCapture.Changes(new AuditChange("preferredMfaMethod", previous, request.Method)), At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<MfaEnrollment>> BeginEnrollment(Guid id, Guid sessionId, SecurityProof proof, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var user = (await users.FindByIdAsync(id.ToString()))!;
        if (await RequiresRecentVerification(user, sessionId, ct))
            return Result<MfaEnrollment>.Fail("auth.reauthentication_required", ErrorKind.Unauthorized);
        if (!await Proof(user, proof, ct)) { await tx.CommitAsync(ct); return Result<MfaEnrollment>.Fail("auth.factor_invalid", ErrorKind.Unauthorized); }
        if (user.TwoFactorEnabled) return Result<MfaEnrollment>.Fail("auth.already_enrolled", ErrorKind.Conflict);
        await users.ResetAuthenticatorKeyAsync(user);
        // Identity rotates the security stamp when resetting the key. Preserve only this setup session.
        await db.Sessions.Where(x => x.UserId == id && x.Id != sessionId && x.RevokedAt == null).ExecuteUpdateAsync(x => x.SetProperty(s => s.RevokedAt, time.GetUtcNow()), ct);
        await db.Sessions.Where(x => x.UserId == id && x.Id == sessionId).ExecuteUpdateAsync(x => x.SetProperty(s => s.SecurityStamp, user.SecurityStamp!), ct);
        var key = (await users.GetAuthenticatorKeyAsync(user))!;
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<MfaEnrollment>.Success(new(key, $"otpauth://totp/templatev4:{Uri.EscapeDataString(user.Email!)}?secret={key}&issuer=templatev4&digits=6"));
    }
    public async Task<Result<string[]>> ConfirmEnrollment(Guid id, Guid sessionId, string code, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(id, ct);
        var user = (await users.FindByIdAsync(id.ToString()))!;
        if (user.TwoFactorEnabled || await users.IsLockedOutAsync(user) || string.IsNullOrWhiteSpace(code) || code.Length > 16 || !await users.VerifyTwoFactorTokenAsync(user, TokenOptions.DefaultAuthenticatorProvider, code.Replace(" ", "")))
        { await users.AccessFailedAsync(user); await tx.CommitAsync(ct); return Result<string[]>.Fail("auth.factor_invalid", ErrorKind.Validation); }
        await users.SetTwoFactorEnabledAsync(user, true);
        user.LastTotpStep = MatchingTotpStep((await users.GetAuthenticatorKeyAsync(user))!, code, time.GetUtcNow());
        var codes = (await users.GenerateNewTwoFactorRecoveryCodesAsync(user, 10))!.ToArray();
        await Changed(user, sessionId, "auth.mfa_enabled", ct);
        await tx.CommitAsync(ct); return Result<string[]>.Success(codes);
    }
    public static long MatchingTotpStep(string key, string code, DateTimeOffset now)
    {
        var bytes = new List<byte>(); int accumulator = 0, bits = 0;
        foreach (var ch in key.ToUpperInvariant().TrimEnd('='))
        {
            var value = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".IndexOf(ch); if (value < 0) return -1;
            accumulator = (accumulator << 5) | value; bits += 5;
            if (bits >= 8) { bits -= 8; bytes.Add((byte)(accumulator >> bits)); }
        }
        for (var step = now.ToUnixTimeSeconds() / 30 + 2; step >= now.ToUnixTimeSeconds() / 30 - 2; step--)
        {
            var counter = new byte[8]; System.Buffers.Binary.BinaryPrimitives.WriteInt64BigEndian(counter, step);
            var hash = HMACSHA1.HashData(bytes.ToArray(), counter); var offset = hash[^1] & 15;
            var number = (System.Buffers.Binary.BinaryPrimitives.ReadInt32BigEndian(hash.AsSpan(offset, 4)) & 0x7fffffff) % 1_000_000;
            if (number.ToString("D6", System.Globalization.CultureInfo.InvariantCulture) == code) return step;
        }
        return -1;
    }
    public async Task<Result<string[]>> ManageMfa(Guid id, Guid sessionId, SecurityProof proof, bool disable, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var user = (await users.FindByIdAsync(id.ToString()))!;
        if (!user.TwoFactorEnabled || !await Proof(user, proof, ct)) { await tx.CommitAsync(ct); return Result<string[]>.Fail("auth.factor_invalid", ErrorKind.Unauthorized); }
        if (disable && !user.EmailMfaEnabled && await GloballyRequired(user, ct) && (await users.GetPasskeysAsync(user)).Count == 0) return Result<string[]>.Fail("auth.mfa_required", ErrorKind.Conflict);
        string[] codes = [];
        if (disable) { await users.SetTwoFactorEnabledAsync(user, false); await users.ResetAuthenticatorKeyAsync(user); await users.GenerateNewTwoFactorRecoveryCodesAsync(user, 0); }
        else codes = (await users.GenerateNewTwoFactorRecoveryCodesAsync(user, 10))!.ToArray();
        await Changed(user, sessionId, disable ? "auth.mfa_disabled" : "auth.recovery_rotated", ct);
        await tx.CommitAsync(ct); return Result<string[]>.Success(codes);
    }
    public async Task Changed(AppUser user, Guid sessionId, string action, CancellationToken ct)
    {
        await users.UpdateSecurityStampAsync(user);
        await db.Sessions.Where(x => x.UserId == user.Id && x.Id != sessionId && x.RevokedAt == null).ExecuteUpdateAsync(x => x.SetProperty(s => s.RevokedAt, time.GetUtcNow()), ct);
        var session = await db.Sessions.SingleAsync(x => x.Id == sessionId && x.UserId == user.Id, ct);
        session.SecurityStamp = user.SecurityStamp!; session.MfaVerified = true; session.SetupOnly = false;
        var culture = await db.Profiles.Where(x => x.Id == user.Id).Select(x => x.Culture).SingleAsync(ct);
        if (AccountDelivery.CanReceiveEmail(user))
            outbox.Add(new EmailRequest(user.Id, EmailTemplate.SecurityNotification, culture));
        db.Audit.Add(new() { ActorId = user.Id, SubjectId = user.Id, Action = action, At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct);
    }
    public async Task<Result<SecuritySettings>> SetPolicy(Guid actor, SecurityPolicyRequest request, CancellationToken ct)
    {
        if (request.MfaPolicy is not ("Optional" or "Administrators" or "Everyone")) return Result<SecuritySettings>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", ct);
        var settings = await db.SecuritySettings.SingleOrDefaultAsync(ct);
        if (settings is not null && settings.Version != request.Version) return Result<SecuritySettings>.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (settings is null)
        {
            if (request.Version != Guid.Empty) return Result<SecuritySettings>.Fail("concurrency.conflict", ErrorKind.Conflict);
            settings = new(); db.SecuritySettings.Add(settings);
        }
        var previousPolicy = settings.MfaPolicy;
        var previousRegistration = settings.RegistrationEnabled;
        settings.MfaPolicy = request.MfaPolicy; settings.RegistrationEnabled = request.RegistrationEnabled; settings.Version = Guid.NewGuid();
        db.Audit.Add(new()
        {
            ActorId = actor,
            Action = "security.policy_changed",
            SubjectType = "configuration", SubjectNameSnapshot = "security",
            ChangesJson = AuditCapture.Changes(new AuditChange("mfaPolicy", previousPolicy, request.MfaPolicy), new("registrationEnabled", previousRegistration.ToString(), request.RegistrationEnabled.ToString())),
            At = time.GetUtcNow()
        });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<SecuritySettings>.Success(settings);
    }
}
