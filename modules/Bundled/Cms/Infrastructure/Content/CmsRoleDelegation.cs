using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Cms;

public sealed class CmsRoleDelegation(CmsDb db) : IScopedRoleDelegation
{
    public async Task<bool> CanDelegate(Guid actor, Guid[] roleIds, CancellationToken ct)
    {
        var actorRoles = db.UserRoles.Where(x => x.UserId == actor).Select(x => x.RoleId);
        var global = await db.RoleClaims.Where(x => actorRoles.Contains(x.RoleId) && x.ClaimType == "permission").Select(x => x.ClaimValue).ToArrayAsync(ct);
        var owned = await db.Set<ContentGrantRow>().Where(x => actorRoles.Contains(x.RoleId)).Select(x => new { x.Collection, x.Permission }).ToArrayAsync(ct);
        var requested = await db.Set<ContentGrantRow>().Where(x => roleIds.Contains(x.RoleId)).Select(x => new { x.Collection, x.Permission }).ToArrayAsync(ct);
        return requested.All(x => global.Contains(x.Permission) || owned.Contains(x) ||
            x.Collection == "articles" && x.Permission is Permissions.CmsRead or Permissions.CmsWrite or Permissions.CmsPublish && global.Contains(Permissions.CmsEdit));
    }
}
