using System.Security.Cryptography;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using templatev4.Application;
using templatev4.Infrastructure.Persistence;

namespace templatev4.Infrastructure.Security;

public sealed record MfaLoginRequest(string ChallengeId, string Code, bool RecoveryCode = false);
public sealed record SecurityProof(string Password, string Code = "", bool RecoveryCode = false);
public sealed record MfaEnrollment(string Key, string Uri);
public sealed record MfaConfirmation(string Code);
public sealed record SecurityPolicyRequest(string MfaPolicy, Guid Version, SecurityProof Proof);
public sealed record ProfileResponse(Guid Id, string Email, string DisplayName, string Culture, string[] Roles, bool MfaEnabled, bool MfaRequired, int RecoveryCodes, PasskeySummary[] Passkeys);
public sealed record PasskeySummary(string Id, string Name, DateTimeOffset CreatedAt);

public sealed class SecurityService(FrameworkDb db, UserManager<AppUser> users, IDataProtectionProvider protection, TimeProvider time, IEventOutbox outbox, Microsoft.AspNetCore.Http.IHttpContextAccessor http)
{
    private readonly IDataProtector protector = protection.CreateProtector("templatev4.authentication-challenge.v1");
    public async Task<SecuritySettings> Settings(CancellationToken ct) => await db.SecuritySettings.AsNoTracking().SingleOrDefaultAsync(ct) ?? new() { Version = Guid.Empty };
    public async Task<bool> Required(AppUser user, CancellationToken ct)
    {
        var policy = (await Settings(ct)).MfaPolicy;
        return policy == "Everyone" || (policy == "Administrators" && await users.IsInRoleAsync(user, "Administrator"));
    }
    public async Task Lock(Guid id, CancellationToken ct)
    {
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({id.ToString()}, 0))", ct);
    }
    public async Task<string> Challenge(AppUser? user, string purpose, string state, string? device, CancellationToken ct)
    {
        var raw = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        db.AuthChallenges.Add(new() { Id = AuthService.Hash(raw), UserId = user?.Id, SecurityStamp = user?.SecurityStamp ?? "", Purpose = purpose, State = protector.Protect(state), Device = (device ?? "Browser")[..Math.Min(device?.Length ?? 7, 200)], ExpiresAt = time.GetUtcNow().AddMinutes(5) });
        await db.SaveChangesAsync(ct); return raw;
    }
    // Caller owns a transaction. Delete and consume are atomic across replicas.
    public async Task<AuthChallenge?> Consume(string raw, string purpose, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(raw) || raw.Length > 128) return null;
        var hash = AuthService.Hash(raw);
        var row = await db.AuthChallenges.FromSqlInterpolated($"SELECT * FROM identity.auth_challenges WHERE \"Id\" = {hash} FOR UPDATE").SingleOrDefaultAsync(ct);
        if (row is null || row.Purpose != purpose || row.ExpiresAt <= time.GetUtcNow()) return null;
        db.AuthChallenges.Remove(row); row.State = protector.Unprotect(row.State); return row;
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
        if ((await users.GetPasskeysAsync(user)).Count > 0)
        {
            var sid = http.HttpContext?.User.FindFirst("sid")?.Value;
            if (!Guid.TryParse(sid, out var sessionId) || !await db.Sessions.AnyAsync(x => x.Id == sessionId && x.UserId == user.Id && x.MfaVerified && x.CreatedAt > time.GetUtcNow().AddMinutes(-5), ct)) return false;
        }
        return true;
    }
    public async Task<ProfileResponse> Profile(Guid id, CancellationToken ct)
    {
        var user = (await users.FindByIdAsync(id.ToString()))!;
        var profile = await db.Profiles.AsNoTracking().SingleAsync(x => x.Id == id, ct);
        return new(id, user.Email!, profile.DisplayName, profile.Culture, (await users.GetRolesAsync(user)).ToArray(), user.TwoFactorEnabled, await Required(user, ct), await users.CountRecoveryCodesAsync(user),
            (await users.GetPasskeysAsync(user)).Select(x => new PasskeySummary(Microsoft.AspNetCore.WebUtilities.WebEncoders.Base64UrlEncode(x.CredentialId), x.Name ?? "Passkey", x.CreatedAt)).ToArray());
    }
    public async Task<Result<MfaEnrollment>> BeginEnrollment(Guid id, Guid sessionId, SecurityProof proof, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var user = (await users.FindByIdAsync(id.ToString()))!;
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
        if (disable && await Required(user, ct) && (await users.GetPasskeysAsync(user)).Count == 0) return Result<string[]>.Fail("auth.mfa_required", ErrorKind.Conflict);
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
        outbox.Add(new EmailRequest(user.Id, EmailTemplate.SecurityNotification, culture));
        db.Audit.Add(new() { ActorId = user.Id, SubjectId = user.Id, Action = action, At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct);
    }
    public async Task<Result<SecuritySettings>> SetPolicy(Guid actor, SecurityPolicyRequest request, CancellationToken ct)
    {
        if (request.MfaPolicy is not ("Optional" or "Administrators" or "Everyone")) return Result<SecuritySettings>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", ct);
        var user = (await users.FindByIdAsync(actor.ToString()))!;
        if (!await Proof(user, request.Proof, ct)) { await tx.CommitAsync(ct); return Result<SecuritySettings>.Fail("auth.factor_invalid", ErrorKind.Unauthorized); }
        var settings = await db.SecuritySettings.SingleOrDefaultAsync(ct);
        if (settings is not null && settings.Version != request.Version) return Result<SecuritySettings>.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (settings is null)
        {
            if (request.Version != Guid.Empty) return Result<SecuritySettings>.Fail("concurrency.conflict", ErrorKind.Conflict);
            settings = new(); db.SecuritySettings.Add(settings);
        }
        settings.MfaPolicy = request.MfaPolicy; settings.Version = Guid.NewGuid();
        db.Audit.Add(new() { ActorId = actor, Action = "security.policy_changed", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<SecuritySettings>.Success(settings);
    }
}
