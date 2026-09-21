using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class AuthService
{

    public async Task<Result<AuthTokens>> Refresh(string? raw, string? ipAddress, CancellationToken ct)
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
            session.RevokedAt = now; Audit("auth.refresh_reuse", session.UserId, session.Id);
            await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
            return Result<AuthTokens>.Fail("auth.refresh_reuse", ErrorKind.Unauthorized);
        }
        var user = await users.FindByIdAsync(session.UserId.ToString());
        var profile = await db.Profiles.SingleOrDefaultAsync(x => x.Id == session.UserId, ct);
        if (session.RevokedAt is not null || session.ExpiresAt <= now || token.ExpiresAt <= now || user is null || profile is null || profile.Disabled || user.RegistrationState is "Pending" or "Rejected" || session.SecurityStamp != user.SecurityStamp)
            return Result<AuthTokens>.Fail("auth.session_invalid", ErrorKind.Unauthorized);
        token.ConsumedAt = now;
        session.IpAddress = NormalizeIp(ipAddress);
        session.LastActivityAt = now;
        var tokens = await Issue(user, session, profile.Culture);
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<AuthTokens>.Success(tokens);
    }
}
