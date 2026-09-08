using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed record PermissionItem(string Key, string Group);
public sealed record RoleItem(Guid Id, string Name, string Description, string Version, bool BuiltIn, int Members, string[] Permissions);
public sealed record AccessCatalog(Page<RoleItem> Roles, PermissionItem[] Permissions);
public sealed record SaveRoleRequest(string Name, string Description, string[] Permissions, string? Version = null);
public sealed record UserAccessDetail(UserDto User, string[] EffectivePermissions, RoleItem[] Roles);

/// <summary>Identity role definitions and delegation policy. Mutations share the administrator lock.</summary>
public sealed class AccessManagementService(FrameworkDb db, IExecutionContext context, TimeProvider time)
{
    public static bool BuiltIn(string name) => name is "Administrator" or "Reader";
    public async Task<Result<AccessCatalog>> Catalog(int pageNumber, int pageSize, string? search, string sort, string direction, CancellationToken ct)
    {
        if (pageNumber is < 1 or > 10000 || pageSize is < 1 or > 100 || search is { Length: > 120 } || sort is not ("name" or "members" or "builtIn") || direction is not ("asc" or "desc"))
            return Result<AccessCatalog>.Fail("validation.failed", ErrorKind.Validation);
        var source = db.Roles.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
            source = source.Where(x => x.Name!.Contains(search) || db.RoleClaims.Any(c => c.RoleId == x.Id && c.ClaimType == "description" && c.ClaimValue!.Contains(search)));
        var total = await source.CountAsync(ct);
        var descending = direction == "desc";
        var ordered = sort switch
        {
            "members" when descending => source.OrderByDescending(x => db.UserRoles.Count(m => m.RoleId == x.Id)).ThenByDescending(x => x.Id),
            "members" => source.OrderBy(x => db.UserRoles.Count(m => m.RoleId == x.Id)).ThenBy(x => x.Id),
            "builtIn" when descending => source.OrderByDescending(x => x.Name == "Administrator" || x.Name == "Reader").ThenByDescending(x => x.Id),
            "builtIn" => source.OrderBy(x => x.Name == "Administrator" || x.Name == "Reader").ThenBy(x => x.Id),
            _ when descending => source.OrderByDescending(x => x.Name).ThenByDescending(x => x.Id),
            _ => source.OrderBy(x => x.Name).ThenBy(x => x.Id)
        };
        var roles = await ordered.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToArrayAsync(ct);
        var items = await RoleItems(roles, ct);
        return Result<AccessCatalog>.Success(new(new(items, total, pageNumber, pageSize), Permissions.All.Select(p => new PermissionItem(p, p.Split('.')[0])).ToArray()));
    }

    public async Task<Result<UserAccessDetail>> User(Guid id, CancellationToken ct)
    {
        var entry = await (from p in db.Profiles.AsNoTracking() join u in db.Users.AsNoTracking() on p.Id equals u.Id where p.Id == id select new { p, u }).SingleOrDefaultAsync(ct);
        if (entry is null) return Result<UserAccessDetail>.Fail("user.not_found", ErrorKind.NotFound);
        var ids = await db.UserRoles.Where(x => x.UserId == id).Select(x => x.RoleId).ToArrayAsync(ct);
        var roles = await RoleItems(await db.Roles.AsNoTracking().Where(x => ids.Contains(x.Id)).OrderBy(x => x.Name).ToArrayAsync(ct), ct);
        return Result<UserAccessDetail>.Success(new(new(id, entry.u.Email!, entry.p.DisplayName, entry.p.Culture, entry.p.Disabled, roles.Select(r => r.Name).ToArray(), entry.p.Version,
            entry.p.Disabled ? "Disabled" : !entry.u.EmailConfirmed || entry.u.PasswordHash == null ? "Invited" : "Active", entry.u.UserName!), roles.SelectMany(r => r.Permissions).Distinct().Order().ToArray(), roles));
    }

    public async Task<Result<RoleItem>> Save(Guid? id, SaveRoleRequest request, CancellationToken ct)
    {
        if (!context.Permissions.Contains(Permissions.Roles)) return Result<RoleItem>.Fail("auth.forbidden", ErrorKind.Forbidden);
        var name = request.Name?.Trim() ?? "";
        if (name.Length is < 2 or > 80 || name.Any(c => !char.IsAsciiLetterOrDigit(c) && c is not (' ' or '-')) || request.Description is null || request.Description.Length > 240 ||
            request.Permissions is null || request.Permissions.Length > Permissions.All.Length || request.Permissions.Distinct().Count() != request.Permissions.Length || request.Permissions.Any(p => !Permissions.All.Contains(p)) ||
            (request.Permissions.Contains(Permissions.Manage) && !request.Permissions.Contains(Permissions.Read)))
            return Result<RoleItem>.Fail("role.invalid", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", ct);
        // Re-read current permissions inside the serialization boundary, never trust stale JWT grants.
        var allowed = await ActorPermissions(ct);
        if (!allowed.Contains(Permissions.Roles)) return Result<RoleItem>.Fail("auth.forbidden", ErrorKind.Forbidden);
        var role = id is null ? null : await db.Roles.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (id is not null && role is null) return Result<RoleItem>.Fail("role.not_found", ErrorKind.NotFound);
        if (BuiltIn(name) || role is not null && BuiltIn(role.Name!)) return Result<RoleItem>.Fail("role.protected", ErrorKind.Conflict);
        if (role is not null && role.ConcurrencyStamp != request.Version) return Result<RoleItem>.Fail("concurrency.conflict", ErrorKind.Conflict);
        var normalized = name.ToUpperInvariant();
        if (await db.Roles.AnyAsync(x => x.NormalizedName == normalized && (id == null || x.Id != id), ct)) return Result<RoleItem>.Fail("role.exists", ErrorKind.Conflict);
        var old = role is null ? [] : await db.RoleClaims.Where(x => x.RoleId == role.Id).ToArrayAsync(ct);
        if (request.Permissions.Concat(old.Where(x => x.ClaimType == "permission").Select(x => x.ClaimValue!)).Any(p => !allowed.Contains(p)))
            return Result<RoleItem>.Fail("role.delegation_denied", ErrorKind.Forbidden);
        // A delegated operator must not alter a role assigned to themselves.
        if (role is not null && await db.UserRoles.AnyAsync(x => x.RoleId == role.Id && x.UserId == context.ActorId, ct))
            return Result<RoleItem>.Fail("role.self_edit", ErrorKind.Conflict);
        if (role is null) { role = new IdentityRole<Guid>(name) { Id = Guid.NewGuid() }; db.Roles.Add(role); }
        role.Name = name; role.NormalizedName = normalized; role.ConcurrencyStamp = Guid.NewGuid().ToString();
        db.RoleClaims.RemoveRange(old.Where(x => x.ClaimType is "permission" or "description"));
        foreach (var p in request.Permissions) db.RoleClaims.Add(new() { RoleId = role.Id, ClaimType = "permission", ClaimValue = p });
        db.RoleClaims.Add(new() { RoleId = role.Id, ClaimType = "description", ClaimValue = request.Description.Trim() });
        var members = db.UserRoles.Where(x => x.RoleId == role.Id).Select(x => x.UserId);
        await db.Sessions.Where(x => members.Contains(x.UserId) && x.RevokedAt == null).ExecuteUpdateAsync(x => x.SetProperty(s => s.RevokedAt, time.GetUtcNow()), ct);
        var previous = old.Where(x => x.ClaimType == "permission").Select(x => x.ClaimValue!).ToArray();
        foreach (var permission in request.Permissions.Except(previous)) db.Audit.Add(new() { ActorId = context.ActorId, SubjectId = role.Id, Action = "role.granted:" + permission, At = time.GetUtcNow() });
        foreach (var permission in previous.Except(request.Permissions)) db.Audit.Add(new() { ActorId = context.ActorId, SubjectId = role.Id, Action = "role.removed:" + permission, At = time.GetUtcNow() });
        db.Audit.Add(new() { ActorId = context.ActorId, SubjectId = role.Id, Action = id is null ? "role.created" : "role.permissions_changed", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<RoleItem>.Success(new(role.Id, name, request.Description.Trim(), role.ConcurrencyStamp, false, await members.CountAsync(ct), request.Permissions.Order().ToArray()));
    }

    public async Task<string[]> ActorPermissions(CancellationToken ct) => await (from m in db.UserRoles join c in db.RoleClaims on m.RoleId equals c.RoleId where m.UserId == context.ActorId && c.ClaimType == "permission" select c.ClaimValue!).Distinct().ToArrayAsync(ct);

    private async Task<RoleItem[]> RoleItems(IdentityRole<Guid>[] roles, CancellationToken ct)
    {
        var ids = roles.Select(x => x.Id).ToArray();
        var claims = await db.RoleClaims.AsNoTracking().Where(x => ids.Contains(x.RoleId)).ToArrayAsync(ct);
        var counts = await db.UserRoles.Where(x => ids.Contains(x.RoleId)).GroupBy(x => x.RoleId).Select(x => new { Id = x.Key, Count = x.Count() }).ToDictionaryAsync(x => x.Id, x => x.Count, ct);
        return roles.Select(r => new RoleItem(r.Id, r.Name!, claims.FirstOrDefault(c => c.RoleId == r.Id && c.ClaimType == "description")?.ClaimValue ?? "",
            r.ConcurrencyStamp!, BuiltIn(r.Name!), counts.GetValueOrDefault(r.Id), claims.Where(c => c.RoleId == r.Id && c.ClaimType == "permission").Select(c => c.ClaimValue!).Order().ToArray())).ToArray();
    }
}
