using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;
using TemplateV4.Application.Users;
using TemplateV4.Application.Platform;
using TemplateV4.Domain.Users;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;

namespace TemplateV4.Infrastructure.Users;

public sealed class UserDirectory(FrameworkDb db, UserManager<AppUser> users, IExecutionContext context, TimeProvider time, IEventOutbox outbox, AccessManagementService access) : IUserDirectory
{
    public async Task<Result<UserDto>> Create(CreateUser command, CancellationToken cancellationToken)
    {
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", cancellationToken);
        if (!await CanAssign(command.Roles, cancellationToken)) return Result<UserDto>.Fail("role.delegation_denied", ErrorKind.Forbidden);
        var identity = new AppUser { Id = Guid.NewGuid(), UserName = command.Email, Email = command.Email, InvitationSentAt = time.GetUtcNow(), InvitationExpiresAt = time.GetUtcNow().AddHours(2) };
        var created = await users.CreateAsync(identity);
        if (!created.Succeeded) return Result<UserDto>.Fail("user.exists", ErrorKind.Conflict);
        var role = await users.AddToRolesAsync(identity, command.Roles);
        if (!role.Succeeded) throw new InvalidOperationException("Seeded role assignment failed.");
        var profile = UserProfile.Create(identity.Id, command.DisplayName, command.Culture);
        db.Profiles.Add(profile); Audit("user.created", identity.Id, new AuditChange("roles", null, string.Join(", ", command.Roles.Order())));
        return Result<UserDto>.Success(new(identity.Id, command.Email, profile.DisplayName, profile.Culture, false, command.Roles, profile.Version, Username: identity.UserName!));
    }

    public async Task<UserDirectoryPage> List(ListUsers query, CancellationToken cancellationToken)
    {
        var source = from profile in db.Profiles.AsNoTracking()
                     join user in db.Users on profile.Id equals user.Id
                     select new { profile, user };
        if (!string.IsNullOrWhiteSpace(query.Search)) source = source.Where(x => x.profile.DisplayName.Contains(query.Search) || x.user.Email!.Contains(query.Search) || x.user.UserName!.Contains(query.Search));
        if (query.Role is not null) source = source.Where(x => db.UserRoles.Where(m => m.UserId == x.user.Id).Join(db.Roles, m => m.RoleId, r => r.Id, (_, r) => r.Name).Any(name => name == query.Role));
        var active = await source.CountAsync(x => !x.profile.Disabled && x.user.EmailConfirmed && x.user.PasswordHash != null, cancellationToken);
        var invited = await source.CountAsync(x => !x.profile.Disabled && (!x.user.EmailConfirmed || x.user.PasswordHash == null), cancellationToken);
        var disabled = await source.CountAsync(x => x.profile.Disabled, cancellationToken);
        source = query.Status switch
        {
            "Active" => source.Where(x => !x.profile.Disabled && x.user.EmailConfirmed && x.user.PasswordHash != null),
            "Invited" => source.Where(x => !x.profile.Disabled && (!x.user.EmailConfirmed || x.user.PasswordHash == null)),
            "Disabled" => source.Where(x => x.profile.Disabled),
            _ => source
        };
        var total = await source.CountAsync(cancellationToken);
        var descending = query.Direction == "desc";
        var ordered = query.Sort switch
        {
            "username" when descending => source.OrderByDescending(x => x.user.UserName).ThenByDescending(x => x.user.Id),
            "username" => source.OrderBy(x => x.user.UserName).ThenBy(x => x.user.Id),
            "email" when descending => source.OrderByDescending(x => x.user.Email).ThenByDescending(x => x.user.Id),
            "email" => source.OrderBy(x => x.user.Email).ThenBy(x => x.user.Id),
            "roles" when descending => source.OrderByDescending(x => db.UserRoles.Where(m => m.UserId == x.user.Id).Join(db.Roles, m => m.RoleId, r => r.Id, (_, r) => r.Name).Order().FirstOrDefault()).ThenByDescending(x => x.user.Id),
            "roles" => source.OrderBy(x => db.UserRoles.Where(m => m.UserId == x.user.Id).Join(db.Roles, m => m.RoleId, r => r.Id, (_, r) => r.Name).Order().FirstOrDefault()).ThenBy(x => x.user.Id),
            "status" when descending => source.OrderByDescending(x => x.profile.Disabled ? 2 : !x.user.EmailConfirmed || x.user.PasswordHash == null ? 1 : 0).ThenByDescending(x => x.user.Id),
            "status" => source.OrderBy(x => x.profile.Disabled ? 2 : !x.user.EmailConfirmed || x.user.PasswordHash == null ? 1 : 0).ThenBy(x => x.user.Id),
            _ when descending => source.OrderByDescending(x => x.profile.DisplayName).ThenByDescending(x => x.user.Id),
            _ => source.OrderBy(x => x.profile.DisplayName).ThenBy(x => x.user.Id)
        };
        var page = await ordered.Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize).ToArrayAsync(cancellationToken);
        var ids = page.Select(x => x.user.Id).ToArray();
        var memberships = await (from membership in db.UserRoles join role in db.Roles on membership.RoleId equals role.Id where ids.Contains(membership.UserId) select new { membership.UserId, role.Name }).ToArrayAsync(cancellationToken);
        var roles = await db.Roles.AsNoTracking().Where(role => role.Name != null).Select(role => role.Name!).Order().ToArrayAsync(cancellationToken);
        return new(page.Select(x => new UserDto(x.user.Id, x.user.Email!, x.profile.DisplayName, x.profile.Culture, x.profile.Disabled,
            memberships.Where(m => m.UserId == x.user.Id).Select(m => m.Name!).Order().ToArray(), x.profile.Version,
            x.profile.Disabled ? "Disabled" : !x.user.EmailConfirmed || x.user.PasswordHash == null ? "Invited" : "Active", x.user.UserName!)).ToArray(), total, query.PageNumber, query.PageSize, active, invited, disabled, roles);
    }

    public async Task<Result<UserDto>> Update(UpdateUser command, CancellationToken cancellationToken)
    {
        // Serializes administrator changes, preventing concurrent removal of the last administrator.
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", cancellationToken);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({command.Id.ToString()}, 0))", cancellationToken);
        var profile = await db.Profiles.SingleOrDefaultAsync(x => x.Id == command.Id, cancellationToken);
        var identity = await users.FindByIdAsync(command.Id.ToString());
        if (profile is null || identity is null) return Result<UserDto>.Fail("user.not_found", ErrorKind.NotFound);
        if (profile.Version != command.Version) return Result<UserDto>.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (context.ActorId == command.Id && (command.Disabled || !command.Roles.Contains("Administrator"))) return Result<UserDto>.Fail("user.self_lockout", ErrorKind.Conflict);
        var oldRoles = await users.GetRolesAsync(identity);
        if (oldRoles.Contains("Administrator") && (command.Disabled || !command.Roles.Contains("Administrator")))
        {
            var admins = await users.GetUsersInRoleAsync("Administrator");
            var ids = admins.Where(x => x.EmailConfirmed && x.PasswordHash != null).Select(x => x.Id).ToArray();
            if (await db.Profiles.CountAsync(x => ids.Contains(x.Id) && !x.Disabled, cancellationToken) <= 1)
                return Result<UserDto>.Fail("user.last_administrator", ErrorKind.Conflict);
        }
        if (!await CanAssign(command.Roles.Concat(oldRoles).Distinct().ToArray(), cancellationToken)) return Result<UserDto>.Fail("role.delegation_denied", ErrorKind.Forbidden);
        var wasDisabled = profile.Disabled;
        profile.SetDisabled(command.Disabled);
        if (!(await users.RemoveFromRolesAsync(identity, oldRoles.Except(command.Roles))).Succeeded || !(await users.AddToRolesAsync(identity, command.Roles.Except(oldRoles))).Succeeded)
            throw new InvalidOperationException("Role update failed.");
        if (!(await users.UpdateSecurityStampAsync(identity)).Succeeded) throw new InvalidOperationException("Security stamp update failed.");
        await db.Sessions.Where(x => x.UserId == command.Id && x.RevokedAt == null).ExecuteUpdateAsync(x => x.SetProperty(s => s.RevokedAt, time.GetUtcNow()), cancellationToken);
        foreach (var roleName in command.Roles.Except(oldRoles)) Audit("user.role_granted", command.Id, new AuditChange("role", null, roleName));
        foreach (var roleName in oldRoles.Except(command.Roles)) Audit("user.role_removed", command.Id, new AuditChange("role", roleName, null));
        if (wasDisabled != command.Disabled) Audit(command.Disabled ? "user.disabled" : "user.enabled", command.Id);
        Audit("user.access_changed", command.Id, new AuditChange("disabled", wasDisabled.ToString(), command.Disabled.ToString()), new("roles", string.Join(", ", oldRoles.Order()), string.Join(", ", command.Roles.Order())));
        outbox.Add(new EmailRequest(command.Id, EmailTemplate.SecurityNotification, profile.Culture));
        return Result<UserDto>.Success(new(identity.Id, identity.Email!, profile.DisplayName, profile.Culture, profile.Disabled, command.Roles, profile.Version, Username: identity.UserName!));
    }
    private async Task<bool> CanAssign(string[] names, CancellationToken ct)
    {
        var allowed = await access.ActorPermissions(ct);
        if (!allowed.Contains(Permissions.Manage)) return false;
        var roles = await db.Roles.Where(r => names.Contains(r.Name!)).Select(r => r.Id).ToArrayAsync(ct);
        if (roles.Length != names.Length) return false;
        return !await db.RoleClaims.AnyAsync(c => roles.Contains(c.RoleId) && c.ClaimType == "permission" && !allowed.Contains(c.ClaimValue!), ct);
    }
    private void Audit(string action, Guid subject, params AuditChange[] changes) => db.Audit.Add(new() { Action = action, SubjectId = subject, SubjectType = "user", ChangesJson = AuditCapture.Changes(changes), ActorId = context.ActorId, At = time.GetUtcNow(), TraceParent = context.TraceParent });
}
