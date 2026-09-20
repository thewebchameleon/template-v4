using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class AuthService(FrameworkDb db, UserManager<AppUser> users, SigningKeys keys, IConfiguration configuration, TimeProvider time, SecurityService security, IDataProtectionProvider protection, IEventOutbox outbox)
{
    private static readonly TimeSpan EmailCodeLifetime = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan EmailSendCooldown = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan EmailFailureCooldown = TimeSpan.FromMinutes(10);
    private readonly IDataProtector _emailCodeProtector = protection.CreateProtector("TemplateV4.email.mfa-code.v1");

    public static string Hash(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    public async Task<AuthTokens> CreateSession(AppUser user, string? device, string? ipAddress, bool verified, CancellationToken ct, bool passkeyVerified = false)
    {
        var profile = await db.Profiles.SingleAsync(x => x.Id == user.Id, ct);
        var now = time.GetUtcNow();
        var session = new Session { UserId = user.Id, SecurityStamp = user.SecurityStamp!, Device = (device ?? "Browser")[..Math.Min(device?.Length ?? 7, 200)], IpAddress = NormalizeIp(ipAddress), CreatedAt = now, LastActivityAt = now, ExpiresAt = now.AddDays(30), MfaVerified = verified, MfaVerifiedAt = verified ? now : null, PasskeyVerified = passkeyVerified, SetupOnly = !verified && await security.Required(user, ct) || await security.PasskeyRequired(user, ct) && !passkeyVerified };
        db.Sessions.Add(session); Audit("auth.login", user.Id);
        return await Issue(user, session, profile.Culture);
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
    private static string NormalizeIp(string? ipAddress) => string.IsNullOrWhiteSpace(ipAddress) ? "unknown" : ipAddress[..Math.Min(ipAddress.Length, 45)];
}

public sealed record AccessResponse(string AccessToken, DateTimeOffset ExpiresAt, Guid UserId, string[] Permissions, string Culture, bool MfaConfigured, bool SetupRequired = false, string? ChallengeId = null, bool PasskeyRequired = false, string[]? MfaMethods = null, string? PreferredMfaMethod = null, bool EmailCodeSent = false, DateTimeOffset? EmailResendAt = null, bool IsAdministrator = false, string TimeZone = "UTC");

public sealed record AuthTokens(AccessResponse Access, string RefreshToken);

public sealed record LoginRequest(string Username, string Password, string Device);

public sealed record SessionQuery(string Search = "", int PageNumber = 1, int PageSize = 10, string Sort = "lastActivityAt", string Direction = "desc");

public sealed record SessionDto(Guid Id, string Device, string IpAddress, DateTimeOffset LastActivityAt, DateTimeOffset CreatedAt, DateTimeOffset ExpiresAt, bool Current);

public sealed record SessionPage(IReadOnlyList<SessionDto> Items, int Total, int PageNumber, int PageSize);

public sealed record EmailMfaChallengeRequest(string ChallengeId);

public sealed record EmailMfaChallengeResponse(DateTimeOffset ExpiresAt, DateTimeOffset ResendAt);
