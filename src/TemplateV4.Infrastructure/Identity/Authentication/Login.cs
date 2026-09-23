using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class AuthService
{
    public async Task<Result<AuthTokens>> Login(LoginRequest request, string? ipAddress, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password) || request.Password.Length > 1024 || request.Username.Length > 256)
            return Result<AuthTokens>.Fail("auth.invalid_credentials", ErrorKind.Unauthorized);
        var user = await users.FindByNameAsync(request.Username);
        if (user is null) { await Task.Delay(TimeSpan.FromMilliseconds(200), time, ct); return Result<AuthTokens>.Fail("auth.invalid_credentials", ErrorKind.Unauthorized); }
        await using var tx = await db.Session.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({user.Id.ToString()}, 0))", ct);
        await db.Entry(user).ReloadAsync(ct);
        var profile = await db.Profiles.SingleOrDefaultAsync(x => x.Id == user.Id, ct);
        if (profile is null || profile.Disabled || user.RegistrationState is "Pending" or "Rejected" || !user.EmailConfirmed || await users.IsLockedOutAsync(user) || !await users.CheckPasswordAsync(user, request.Password))
        {
            if (!await users.IsLockedOutAsync(user)) await users.AccessFailedAsync(user);
            Audit("auth.login_failed", user.Id); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
            return Result<AuthTokens>.Fail("auth.invalid_credentials", ErrorKind.Unauthorized);
        }
        var methods = await security.ConfiguredMethods(user);
        if (methods.Length > 0)
        {
            var preferred = SecurityService.PreferredMethod(user, methods);
            var code = "";
            var codeSent = false;
            var resendAt = user.EmailMfaLastSentAt?.Add(EmailSendCooldown);
            if (user.EmailMfaLockedUntil is { } lockedUntil && lockedUntil > time.GetUtcNow()) resendAt = lockedUntil;
            else if (preferred == MfaMethods.Email && methods.Contains(MfaMethods.Email) && (resendAt is null || resendAt <= time.GetUtcNow()))
            {
                code = CreateEmailCode();
                QueueEmailCode(user, profile.Culture, code);
                user.EmailMfaLastSentAt = time.GetUtcNow();
                resendAt = user.EmailMfaLastSentAt.Value.Add(EmailSendCooldown);
                codeSent = true;
            }
            var challenge = await security.Challenge(user, "mfa-login", code, request.Device, ct, EmailCodeLifetime);
            await tx.CommitAsync(ct);
            return Result<AuthTokens>.Success(new(new("", time.GetUtcNow().Add(EmailCodeLifetime), user.Id, [], profile.Culture, true, false, challenge, false, methods, preferred, codeSent, resendAt), ""));
        }
        await users.ResetAccessFailedCountAsync(user);
        var tokens = await CreateSession(user, request.Device, ipAddress, false, ct);
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<AuthTokens>.Success(tokens);
    }

    public async Task<Result<AuthTokens>> CompleteMfa(MfaLoginRequest request, string? ipAddress, CancellationToken ct)
    {
        await using var tx = await db.Session.BeginTransactionAsync(ct);
        var challenge = await security.ReadChallenge(request.ChallengeId, "mfa-login", ct);
        var user = challenge?.Row.UserId is { } id ? await users.FindByIdAsync(id.ToString()) : null;
        if (user is null || challenge!.Row.SecurityStamp != user.SecurityStamp)
        {
            await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
            return Result<AuthTokens>.Fail("auth.challenge_expired", ErrorKind.Unauthorized);
        }
        await security.Lock(user.Id, ct); await db.Entry(user).ReloadAsync(ct);
        if (user.RegistrationState is "Pending" or "Rejected" || challenge.Row.SecurityStamp != user.SecurityStamp)
            return Result<AuthTokens>.Fail("auth.challenge_expired", ErrorKind.Unauthorized);
        var methods = await security.ConfiguredMethods(user);
        if (!methods.Contains(request.Method) || request.Method == MfaMethods.Passkey)
            return Result<AuthTokens>.Fail("auth.mfa_method_unavailable", ErrorKind.Validation);
        var valid = request.Method == MfaMethods.Email
            ? await VerifyEmailCode(user, challenge.State, request.Code, ct)
            : await security.VerifyCode(user, request.Code, request.RecoveryCode, ct);
        if (!valid)
        {
            await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
            return Result<AuthTokens>.Fail(user.EmailMfaLockedUntil > time.GetUtcNow() ? "auth.email_code_locked" : "auth.factor_invalid", ErrorKind.Unauthorized);
        }
        db.AuthChallenges.Remove(challenge.Row);
        var tokens = await CreateSession(user, challenge.Row.Device, ipAddress, true, ct);
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<AuthTokens>.Success(tokens);
    }
}
