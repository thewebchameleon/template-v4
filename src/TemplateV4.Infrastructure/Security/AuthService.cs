using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TemplateV4.Application;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed record AccessResponse(string AccessToken, DateTimeOffset ExpiresAt, Guid UserId, string[] Permissions, string Culture, bool MfaConfigured, bool SetupRequired = false, string? ChallengeId = null, bool PasskeyRequired = false, string[]? MfaMethods = null, string? PreferredMfaMethod = null, bool EmailCodeSent = false, DateTimeOffset? EmailResendAt = null, bool IsAdministrator = false, string TimeZone = "UTC");
public sealed record AuthTokens(AccessResponse Access, string RefreshToken);
public sealed record LoginRequest(string Username, string Password, string Device);
public sealed record SessionDto(Guid Id, string Device, DateTimeOffset CreatedAt, DateTimeOffset ExpiresAt, bool Current);
public sealed record EmailMfaChallengeRequest(string ChallengeId);
public sealed record EmailMfaChallengeResponse(DateTimeOffset ExpiresAt, DateTimeOffset ResendAt);

public sealed class AuthService(FrameworkDb db, UserManager<AppUser> users, SigningKeys keys, IConfiguration configuration, TimeProvider time, SecurityService security, IDataProtectionProvider protection, IEventOutbox outbox)
{
    private static readonly TimeSpan EmailCodeLifetime = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan EmailSendCooldown = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan EmailFailureCooldown = TimeSpan.FromMinutes(10);
    private readonly IDataProtector _emailCodeProtector = protection.CreateProtector("TemplateV4.email.mfa-code.v1");

    public static string Hash(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    public async Task<Result<AuthTokens>> Login(LoginRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password) || request.Password.Length > 1024 || request.Username.Length > 256)
            return Result<AuthTokens>.Fail("auth.invalid_credentials", ErrorKind.Unauthorized);
        var user = await users.FindByNameAsync(request.Username);
        if (user is null) { await Task.Delay(TimeSpan.FromMilliseconds(200), time, ct); return Result<AuthTokens>.Fail("auth.invalid_credentials", ErrorKind.Unauthorized); }
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({user.Id.ToString()}, 0))", ct);
        await db.Entry(user).ReloadAsync(ct);
        var profile = await db.Profiles.SingleOrDefaultAsync(x => x.Id == user.Id, ct);
        if (profile is null || profile.Disabled || !user.EmailConfirmed || await users.IsLockedOutAsync(user) || !await users.CheckPasswordAsync(user, request.Password))
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
        var tokens = await CreateSession(user, request.Device, false, ct);
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<AuthTokens>.Success(tokens);
    }

    public async Task<Result<AuthTokens>> CompleteMfa(MfaLoginRequest request, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var challenge = await security.ReadChallenge(request.ChallengeId, "mfa-login", ct);
        var user = challenge?.Row.UserId is { } id ? await users.FindByIdAsync(id.ToString()) : null;
        if (user is null || challenge!.Row.SecurityStamp != user.SecurityStamp)
        {
            await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
            return Result<AuthTokens>.Fail("auth.challenge_expired", ErrorKind.Unauthorized);
        }
        await security.Lock(user.Id, ct); await db.Entry(user).ReloadAsync(ct);
        if (challenge.Row.SecurityStamp != user.SecurityStamp)
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
        var tokens = await CreateSession(user, challenge.Row.Device, true, ct);
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<AuthTokens>.Success(tokens);
    }

    public async Task<Result<EmailMfaChallengeResponse>> SendEmailCode(EmailMfaChallengeRequest request, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
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

    public async Task<AuthTokens> CreateSession(AppUser user, string? device, bool verified, CancellationToken ct, bool passkeyVerified = false)
    {
        var profile = await db.Profiles.SingleAsync(x => x.Id == user.Id, ct);
        var session = new Session { UserId = user.Id, SecurityStamp = user.SecurityStamp!, Device = (device ?? "Browser")[..Math.Min(device?.Length ?? 7, 200)], CreatedAt = time.GetUtcNow(), ExpiresAt = time.GetUtcNow().AddDays(30), MfaVerified = verified, MfaVerifiedAt = verified ? time.GetUtcNow() : null, PasskeyVerified = passkeyVerified, SetupOnly = !verified && await security.Required(user, ct) || await security.PasskeyRequired(user, ct) && !passkeyVerified };
        db.Sessions.Add(session); Audit("auth.login", user.Id);
        return await Issue(user, session, profile.Culture);
    }

    public async Task<Result<AuthTokens>> Refresh(string? raw, CancellationToken ct)
    {
        if (raw is null || raw.Length > 256) return Result<AuthTokens>.Fail("auth.session_invalid", ErrorKind.Unauthorized);
        var hash = Hash(raw);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        // Lock the family, not just the token: concurrent rotations/revocations cannot resurrect it.
        var sessionId = await db.RefreshTokens.Where(x => x.Hash == hash).Select(x => (Guid?)x.SessionId).SingleOrDefaultAsync(ct);
        if (sessionId is null) return Result<AuthTokens>.Fail("auth.session_invalid", ErrorKind.Unauthorized);
        var session = await db.Sessions.FromSqlInterpolated($"SELECT * FROM identity.sessions WHERE \"Id\" = {sessionId.Value} FOR UPDATE").SingleAsync(ct);
        var token = await db.RefreshTokens.SingleAsync(x => x.Hash == hash, ct);
        var now = time.GetUtcNow();
        if (token.ConsumedAt is not null)
        {
            session.RevokedAt = now; Audit("auth.refresh_reuse", session.UserId);
            await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
            return Result<AuthTokens>.Fail("auth.refresh_reuse", ErrorKind.Unauthorized);
        }
        var user = await users.FindByIdAsync(session.UserId.ToString());
        var profile = await db.Profiles.SingleOrDefaultAsync(x => x.Id == session.UserId, ct);
        if (session.RevokedAt is not null || session.ExpiresAt <= now || token.ExpiresAt <= now || user is null || profile is null || profile.Disabled || session.SecurityStamp != user.SecurityStamp)
            return Result<AuthTokens>.Fail("auth.session_invalid", ErrorKind.Unauthorized);
        token.ConsumedAt = now;
        var tokens = await Issue(user, session, profile.Culture);
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<AuthTokens>.Success(tokens);
    }

    public async Task<bool> Validate(ClaimsPrincipal principal, CancellationToken ct)
    {
        if (!Guid.TryParse(principal.FindFirstValue("sub"), out var userId) || !Guid.TryParse(principal.FindFirstValue("sid"), out var sessionId)) return false;
        var now = time.GetUtcNow();
        var valid = await (from session in db.Sessions
                           join user in db.Users on session.UserId equals user.Id
                           join profile in db.Profiles on user.Id equals profile.Id
                           where session.Id == sessionId && user.Id == userId && session.RevokedAt == null && session.ExpiresAt > now && !profile.Disabled && user.SecurityStamp == session.SecurityStamp
                           select session.Id).AnyAsync(ct);
        if (!valid) return false;
        var live = await db.Sessions.AsNoTracking().SingleAsync(x => x.Id == sessionId, ct);
        var owner = await users.FindByIdAsync(userId.ToString());
        if (await security.PasskeyRequired(owner!, ct) && !live.PasskeyVerified || live.SetupOnly || (!live.MfaVerified && await security.Required(owner!, ct)))
            ((ClaimsIdentity)principal.Identity!).AddClaim(new("setup_only", "true"));
        return true;
    }

    public async Task Revoke(Guid userId, Guid? sessionId, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Sessions.Where(x => x.UserId == userId && (sessionId == null || x.Id == sessionId) && x.RevokedAt == null)
            .ExecuteUpdateAsync(x => x.SetProperty(s => s.RevokedAt, time.GetUtcNow()), ct);
        Audit("auth.session_revoked", userId); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
    }
    public async Task<SessionDto[]> ListSessions(Guid userId, Guid currentSessionId, CancellationToken ct) =>
        await db.Sessions.AsNoTracking()
            .Where(x => x.UserId == userId && x.RevokedAt == null && x.ExpiresAt > time.GetUtcNow())
            .OrderByDescending(x => x.CreatedAt)
            .Take(100)
            .Select(x => new SessionDto(x.Id, x.Device, x.CreatedAt, x.ExpiresAt, x.Id == currentSessionId))
            .ToArrayAsync(ct);
    public async Task Logout(string? raw, CancellationToken ct)
    {
        if (raw is null || raw.Length > 256) return;
        var hash = Hash(raw);
        var session = await (from token in db.RefreshTokens join s in db.Sessions on token.SessionId equals s.Id where token.Hash == hash select s).AsNoTracking().SingleOrDefaultAsync(ct);
        if (session is not null) await Revoke(session.UserId, session.Id, ct);
    }
    private async Task<AuthTokens> Issue(AppUser user, Session session, string culture)
    {
        var roles = await users.GetRolesAsync(user);
        var mfaConfigured = (await security.ConfiguredMethods(user)).Length > 0;
        var setup = await security.PasskeyRequired(user, default) && !session.PasskeyVerified || session.SetupOnly || (!session.MfaVerified && await security.Required(user, default));
        var permissions = await (from membership in db.UserRoles
                                 join claim in db.RoleClaims on membership.RoleId equals claim.RoleId
                                 where membership.UserId == user.Id && claim.ClaimType == "permission"
                                 select claim.ClaimValue!).Distinct().ToArrayAsync();
        var claims = new List<Claim> { new("sub", user.Id.ToString()), new("sid", session.Id.ToString()), new("culture", culture), new("jti", Guid.NewGuid().ToString()) };
        if (setup) permissions = [];
        claims.AddRange(roles.Select(x => new Claim("role", x))); claims.AddRange(permissions.Select(x => new Claim("permission", x)));
        var now = time.GetUtcNow(); var expires = now.AddMinutes(5);
        var jwt = new JwtSecurityToken(configuration["Jwt:Issuer"] ?? "templatev4", configuration["Jwt:Audience"] ?? "templatev4-web", claims, now.UtcDateTime, expires.UtcDateTime,
            new SigningCredentials(keys.Active, SecurityAlgorithms.RsaSha256));
        var raw = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        db.RefreshTokens.Add(new() { Hash = Hash(raw), SessionId = session.Id, ExpiresAt = session.ExpiresAt });
        return new(new(new JwtSecurityTokenHandler().WriteToken(jwt), expires, user.Id, permissions, culture, mfaConfigured, setup, IsAdministrator: !setup && roles.Contains("Administrator"), TimeZone: await db.Profiles.Where(x => x.Id == user.Id).Select(x => x.TimeZone).SingleAsync()), raw);
    }
    private void Audit(string action, Guid userId) => db.Audit.Add(new() { Action = action, ActorId = action == "auth.login_failed" ? null : userId, ActorType = action == "auth.login_failed" ? "anonymous" : "user", SubjectId = userId, SubjectType = "user", Outcome = action == "auth.login_failed" ? "failure" : action == "auth.refresh_reuse" ? "denied" : "success", FailureCode = action == "auth.login_failed" ? "auth.invalid_credentials" : action == "auth.refresh_reuse" ? "auth.refresh_reuse" : null, At = time.GetUtcNow(), TraceParent = System.Diagnostics.Activity.Current?.Id });
}
