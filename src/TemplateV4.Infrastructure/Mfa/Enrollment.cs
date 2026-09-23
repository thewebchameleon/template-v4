using System.Security.Cryptography;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class SecurityService
{
    public async Task<Result<MfaEnrollment>> BeginEnrollment(Guid id, Guid sessionId, SecurityProof proof, CancellationToken ct)
    {
        await using var tx = await db.Session.BeginTransactionAsync(ct);
        var user = (await users.FindByIdAsync(id.ToString()))!;
        var setupEnrollment = string.IsNullOrEmpty(proof.Password);
        if (await RequiresRecentVerification(user, sessionId, ct) || setupEnrollment && !await CanEnrollFromSetupSession(user, sessionId, ct))
            return Result<MfaEnrollment>.Fail("auth.reauthentication_required", ErrorKind.Unauthorized);
        if (!setupEnrollment && !await Proof(user, proof, ct)) { await tx.CommitAsync(ct); return Result<MfaEnrollment>.Fail("auth.factor_invalid", ErrorKind.Unauthorized); }
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
        await using var tx = await db.Session.BeginTransactionAsync(ct); await Lock(id, ct);
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
        await using var tx = await db.Session.BeginTransactionAsync(ct);
        var user = (await users.FindByIdAsync(id.ToString()))!;
        if (!user.TwoFactorEnabled || !await Proof(user, proof, ct)) { await tx.CommitAsync(ct); return Result<string[]>.Fail("auth.factor_invalid", ErrorKind.Unauthorized); }
        if (disable && !user.EmailMfaEnabled && await GloballyRequired(user, ct) && (await users.GetPasskeysAsync(user)).Count == 0) return Result<string[]>.Fail("auth.mfa_required", ErrorKind.Conflict);
        string[] codes = [];
        if (disable) { await users.SetTwoFactorEnabledAsync(user, false); await users.ResetAuthenticatorKeyAsync(user); await users.GenerateNewTwoFactorRecoveryCodesAsync(user, 0); }
        else codes = (await users.GenerateNewTwoFactorRecoveryCodesAsync(user, 10))!.ToArray();
        await Changed(user, sessionId, disable ? "auth.mfa_disabled" : "auth.recovery_rotated", ct);
        await tx.CommitAsync(ct); return Result<string[]>.Success(codes);
    }
}
