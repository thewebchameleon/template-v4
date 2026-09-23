using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class AuthService
{

    public async Task<Result<EmailMfaChallengeResponse>> SendEmailCode(EmailMfaChallengeRequest request, CancellationToken ct)
    {
        await using var tx = await db.Session.BeginTransactionAsync(ct);
        var challenge = await security.ReadChallenge(request.ChallengeId, "mfa-login", ct);
        var user = challenge?.Row.UserId is { } id ? await users.FindByIdAsync(id.ToString()) : null;
        if (user is null || challenge!.Row.SecurityStamp != user.SecurityStamp || !(await security.ConfiguredMethods(user)).Contains(MfaMethods.Email))
            return Result<EmailMfaChallengeResponse>.Fail("auth.challenge_expired", ErrorKind.Unauthorized);
        await security.Lock(user.Id, ct); await db.Entry(user).ReloadAsync(ct);
        if (challenge.Row.SecurityStamp != user.SecurityStamp || !(await security.ConfiguredMethods(user)).Contains(MfaMethods.Email))
            return Result<EmailMfaChallengeResponse>.Fail("auth.challenge_expired", ErrorKind.Unauthorized);
        var now = time.GetUtcNow();
        if (user.EmailMfaLockedUntil is { } lockedUntil && lockedUntil > now)
            return Result<EmailMfaChallengeResponse>.Fail("auth.email_code_locked", ErrorKind.Conflict);
        if (user.EmailMfaLastSentAt?.Add(EmailSendCooldown) is { } resendAt && resendAt > now)
            return Result<EmailMfaChallengeResponse>.Fail("auth.email_code_cooldown", ErrorKind.Conflict);
        var code = CreateEmailCode();
        security.SetChallengeState(challenge, code);
        challenge.Row.ExpiresAt = now.Add(EmailCodeLifetime);
        user.EmailMfaLastSentAt = now;
        var culture = await db.Profiles.Where(x => x.Id == user.Id).Select(x => x.Culture).SingleAsync(ct);
        QueueEmailCode(user, culture, code);
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<EmailMfaChallengeResponse>.Success(new(challenge.Row.ExpiresAt, now.Add(EmailSendCooldown)));
    }

    private static string CreateEmailCode() => RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6", System.Globalization.CultureInfo.InvariantCulture);
    private void QueueEmailCode(AppUser user, string culture, string code) =>
        outbox.Add(new EmailRequest(user.Id, EmailTemplate.MfaCode, culture, ProtectedContent: _emailCodeProtector.Protect(code)));
    private async Task<bool> VerifyEmailCode(AppUser user, string expected, string supplied, CancellationToken ct)
    {
        await security.Lock(user.Id, ct); await db.Entry(user).ReloadAsync(ct);
        var now = time.GetUtcNow();
        if (user.EmailMfaLockedUntil is { } lockedUntil && lockedUntil > now) return false;
        if (user.EmailMfaLockedUntil <= now)
        {
            user.EmailMfaLockedUntil = null;
            user.EmailMfaFailedAttempts = 0;
        }
        var normalized = supplied?.Trim() ?? "";
        var valid = expected.Length == 6 && normalized.Length == 6 && CryptographicOperations.FixedTimeEquals(SHA256.HashData(Encoding.UTF8.GetBytes(expected)), SHA256.HashData(Encoding.UTF8.GetBytes(normalized)));
        if (valid)
        {
            user.EmailMfaFailedAttempts = 0;
            user.EmailMfaLockedUntil = null;
            await users.ResetAccessFailedCountAsync(user);
            return true;
        }
        user.EmailMfaFailedAttempts++;
        if (user.EmailMfaFailedAttempts >= 5)
        {
            user.EmailMfaFailedAttempts = 0;
            user.EmailMfaLockedUntil = now.Add(EmailFailureCooldown);
        }
        return false;
    }
}
