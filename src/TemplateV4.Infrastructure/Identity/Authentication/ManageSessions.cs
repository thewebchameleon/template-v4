using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class AuthService
{

    public async Task<bool> Validate(ClaimsPrincipal principal, CancellationToken ct)
    {
        if (!Guid.TryParse(principal.FindFirstValue("sub"), out var userId) || !Guid.TryParse(principal.FindFirstValue("sid"), out var sessionId)) return false;
        var now = time.GetUtcNow();
        var valid = await (from session in db.Sessions
                           join user in db.Users on session.UserId equals user.Id
                           join profile in db.Profiles on user.Id equals profile.Id
                           where session.Id == sessionId && user.Id == userId && session.RevokedAt == null && session.ExpiresAt > now && !profile.Disabled && user.RegistrationState != "Pending" && user.RegistrationState != "Rejected" && user.SecurityStamp == session.SecurityStamp
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
}
