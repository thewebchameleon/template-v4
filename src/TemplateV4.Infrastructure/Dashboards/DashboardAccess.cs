using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Dashboards;

public sealed class DashboardAccess(FrameworkDb db)
{
    public Task<bool> Has(Guid actor, string permission, CancellationToken ct) =>
        (from member in db.UserRoles join claim in db.RoleClaims on member.RoleId equals claim.RoleId
         where member.UserId == actor && claim.ClaimType == "permission" && claim.ClaimValue == permission select claim).AnyAsync(ct);
    public async Task<bool> Administrator(Guid actor, CancellationToken ct) =>
        await (from member in db.UserRoles join role in db.Roles on member.RoleId equals role.Id
               where member.UserId == actor && role.Name == "Administrator" select role).AnyAsync(ct)
        && await Has(actor, Permissions.Settings, ct);
}
