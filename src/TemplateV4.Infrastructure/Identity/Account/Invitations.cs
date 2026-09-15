using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;
using TemplateV4.Application.Users;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class AccountService
{
    public async Task<Result<InvitationPage>> Invitations(int pageNumber, int pageSize, string? search, string state, string sort, string direction, CancellationToken ct)
    {
        if (pageNumber is < 1 or > 10000 || pageSize is < 1 or > 100 || search is { Length: > 120 } || state is not ("all" or "Pending" or "Expired" or "Accepted" or "Revoked") || sort is not ("displayName" or "state" or "expiresAt" or "sentAt") || direction is not ("asc" or "desc")) return Result<InvitationPage>.Fail("validation.failed", ErrorKind.Validation);
        var now = time.GetUtcNow();
        var source = from u in db.Users.AsNoTracking()
                     join p in db.Profiles.AsNoTracking() on u.Id equals p.Id
                     where u.InvitationSentAt != null || u.PasswordHash == null
                     select new { u, p, State = u.InvitationCancelledAt != null || p.Disabled ? "Revoked" : u.PasswordHash != null && u.EmailConfirmed ? "Accepted" : u.InvitationExpiresAt < now ? "Expired" : "Pending" };
        if (!string.IsNullOrWhiteSpace(search)) source = source.Where(x => x.p.DisplayName.Contains(search) || x.u.Email!.Contains(search));
        var pending = await source.CountAsync(x => x.State == "Pending", ct);
        var expired = await source.CountAsync(x => x.State == "Expired", ct);
        var accepted = await source.CountAsync(x => x.State == "Accepted", ct);
        var revoked = await source.CountAsync(x => x.State == "Revoked", ct);
        if (state != "all") source = source.Where(x => x.State == state);
        var total = await source.CountAsync(ct);
        var descending = direction == "desc";
        var ordered = sort switch
        {
            "displayName" when descending => source.OrderByDescending(x => x.p.DisplayName).ThenByDescending(x => x.u.Id),
            "displayName" => source.OrderBy(x => x.p.DisplayName).ThenBy(x => x.u.Id),
            "state" when descending => source.OrderByDescending(x => x.State).ThenByDescending(x => x.u.Id),
            "state" => source.OrderBy(x => x.State).ThenBy(x => x.u.Id),
            "expiresAt" when descending => source.OrderByDescending(x => x.u.InvitationExpiresAt).ThenByDescending(x => x.u.Id),
            "expiresAt" => source.OrderBy(x => x.u.InvitationExpiresAt).ThenBy(x => x.u.Id),
            _ when descending => source.OrderByDescending(x => x.u.InvitationSentAt).ThenByDescending(x => x.u.Id),
            _ => source.OrderBy(x => x.u.InvitationSentAt).ThenBy(x => x.u.Id)
        };
        var items = await ordered.Skip((pageNumber - 1) * pageSize).Take(pageSize)
            .Select(x => new InvitationItem(x.u.Id, x.p.DisplayName, x.u.Email!, x.State, x.u.EmailConfirmed, x.u.InvitationSentAt, x.u.InvitationExpiresAt, x.u.InvitationAcceptedAt, x.u.InvitationSentAt == null ? null : x.u.InvitationSentAt.Value.AddMinutes(2))).ToArrayAsync(ct);
        return Result<InvitationPage>.Success(new(items, total, pageNumber, pageSize, pending, expired, accepted, revoked));
    }
    public async Task<Result<Unit>> Invitation(Guid actor, InvitationRequest request, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", ct);
        var allowed = await access.ActorPermissions(ct);
        if (!allowed.Contains(Permissions.Manage)) return Result.Fail("role.delegation_denied", ErrorKind.Forbidden);
        if (await (from m in db.UserRoles join c in db.RoleClaims on m.RoleId equals c.RoleId where m.UserId == request.UserId && c.ClaimType == "permission" && !allowed.Contains(c.ClaimValue!) select c.Id).AnyAsync(ct))
            return Result.Fail("role.delegation_denied", ErrorKind.Forbidden);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({request.UserId.ToString()}, 0))", ct);
        var user = await users.FindByIdAsync(request.UserId.ToString());
        var profile = await db.Profiles.SingleOrDefaultAsync(x => x.Id == request.UserId, ct);
        if (user is null || profile is null || user.PasswordHash is not null || user.InvitationCancelledAt != null) return Result.Fail("invitation.not_pending", ErrorKind.Conflict);
        await users.UpdateSecurityStampAsync(user);
        if (request.Cancel) { profile.SetDisabled(true); user.InvitationCancelledAt = time.GetUtcNow(); }
        else
        {
            if (profile.Disabled) return Result.Fail("invitation.disabled", ErrorKind.Conflict);
            if (user.InvitationSentAt > time.GetUtcNow().AddMinutes(-2)) return Result.Fail("invitation.wait", ErrorKind.Conflict);
            if (!await limiter.Allow("invitation", user.Id.ToString(), 1, TimeSpan.FromMinutes(2), ct)) return Result.Fail("invitation.wait", ErrorKind.Conflict);
            await QueueAction(user, user.EmailConfirmed ? EmailTemplate.PasswordReset : EmailTemplate.Verification, profile.Culture, ct);
        }
        db.Audit.Add(new() { ActorId = actor, SubjectId = user.Id, Action = request.Cancel ? "invitation.cancelled" : "invitation.resent", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
