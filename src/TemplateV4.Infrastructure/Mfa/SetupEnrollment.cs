using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class SecurityService
{
    public async Task<bool> CanEnrollFromSetupSession(AppUser user, Guid sessionId, CancellationToken ct)
    {
        await Lock(user.Id, ct);
        await db.Entry(user).ReloadAsync(ct);
        if (user.RegistrationState is "Pending" or "Rejected" || !user.EmailConfirmed || await users.IsLockedOutAsync(user) ||
            !await db.Profiles.AnyAsync(x => x.Id == user.Id && !x.Disabled, ct) ||
            (await ConfiguredMethods(user)).Length > 0 ||
            !(await PasskeyRequired(user, ct) || await GloballyRequired(user, ct))) return false;

        var session = await db.Sessions.AsNoTracking().SingleOrDefaultAsync(x => x.Id == sessionId, ct);
        return IsRecentSetupSession(session, user, time.GetUtcNow());
    }

    // Setup-only sessions are created after login proof. Refresh rotates tokens without
    // changing CreatedAt, so it cannot extend this enrollment authorization window.
    public static bool IsRecentSetupSession(Session? session, AppUser user, DateTimeOffset now) =>
        session is { SetupOnly: true, MfaVerified: false, PasskeyVerified: false, RevokedAt: null } &&
        session.UserId == user.Id && session.SecurityStamp == user.SecurityStamp &&
        session.ExpiresAt > now && session.CreatedAt > now.AddMinutes(-5) && session.CreatedAt <= now;
}
