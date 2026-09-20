using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class AuthService
{

    public async Task<bool> Validate(ClaimsPrincipal principal, string? ipAddress, CancellationToken ct)
    {
        if (!Guid.TryParse(principal.FindFirstValue("sub"), out var userId) || !Guid.TryParse(principal.FindFirstValue("sid"), out var sessionId)) return false;
        var now = time.GetUtcNow();
        var valid = await (from session in db.Sessions
                           join user in db.Users on session.UserId equals user.Id
                           join profile in db.Profiles on user.Id equals profile.Id
                           where session.Id == sessionId && user.Id == userId && session.RevokedAt == null && session.ExpiresAt > now && !profile.Disabled && user.RegistrationState != "Pending" && user.RegistrationState != "Rejected" && user.SecurityStamp == session.SecurityStamp
                           select session.Id).AnyAsync(ct);
        if (!valid) return false;
        await db.Sessions.Where(x => x.Id == sessionId)
            .ExecuteUpdateAsync(x => x
                .SetProperty(s => s.IpAddress, NormalizeIp(ipAddress))
                .SetProperty(s => s.LastActivityAt, now), ct);
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
    public async Task<Result<SessionPage>> ListSessions(Guid userId, Guid currentSessionId, SessionQuery query, CancellationToken ct)
    {
        if (query.Search is null or { Length: > 200 } || query.PageNumber is < 1 or > 10000 ||
            query.PageSize is not (5 or 10 or 25 or 50) ||
            query.Sort is not ("device" or "ipAddress" or "lastActivityAt" or "createdAt" or "expiresAt" or "current") ||
            query.Direction is not ("asc" or "desc"))
            return Result<SessionPage>.Fail("validation.failed", ErrorKind.Validation);

        var sessions = db.Sessions.AsNoTracking()
            .Where(x => x.UserId == userId && x.RevokedAt == null && x.ExpiresAt > time.GetUtcNow());
        var search = query.Search.Trim();
        if (search.Length > 0)
            sessions = sessions.Where(x => x.Device.Contains(search) || x.IpAddress.Contains(search));

        var total = await sessions.CountAsync(ct);
        var ascending = query.Direction == "asc";
        var ordered = query.Sort switch
        {
            "device" => ascending ? sessions.OrderBy(x => x.Device) : sessions.OrderByDescending(x => x.Device),
            "ipAddress" => ascending ? sessions.OrderBy(x => x.IpAddress) : sessions.OrderByDescending(x => x.IpAddress),
            "createdAt" => ascending ? sessions.OrderBy(x => x.CreatedAt) : sessions.OrderByDescending(x => x.CreatedAt),
            "expiresAt" => ascending ? sessions.OrderBy(x => x.ExpiresAt) : sessions.OrderByDescending(x => x.ExpiresAt),
            "current" => ascending ? sessions.OrderBy(x => x.Id == currentSessionId) : sessions.OrderByDescending(x => x.Id == currentSessionId),
            _ => ascending
                ? sessions.OrderBy(x => x.LastActivityAt < x.CreatedAt ? x.CreatedAt : x.LastActivityAt)
                : sessions.OrderByDescending(x => x.LastActivityAt < x.CreatedAt ? x.CreatedAt : x.LastActivityAt)
        };
        var items = await ordered.ThenBy(x => x.Id)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new SessionDto(x.Id, x.Device, x.IpAddress == "" ? "unknown" : x.IpAddress,
                x.LastActivityAt < x.CreatedAt ? x.CreatedAt : x.LastActivityAt, x.CreatedAt, x.ExpiresAt, x.Id == currentSessionId))
            .ToArrayAsync(ct);
        return Result<SessionPage>.Success(new(items, total, query.PageNumber, query.PageSize));
    }
    public async Task Logout(string? raw, CancellationToken ct)
    {
        if (raw is null || raw.Length > 256) return;
        var hash = Hash(raw);
        var session = await (from token in db.RefreshTokens join s in db.Sessions on token.SessionId equals s.Id where token.Hash == hash select s).AsNoTracking().SingleOrDefaultAsync(ct);
        if (session is not null) await Revoke(session.UserId, session.Id, ct);
    }
}
