using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Cms;

public sealed class CmsAccessIndicators(CmsDb db) : IAccessIndicators
{
    public async Task<string[]> Read(Guid actor, CancellationToken ct) =>
        await db.Set<ContentGrantRow>().AnyAsync(x => db.UserRoles.Any(r => r.UserId == actor && r.RoleId == x.RoleId), ct) ? ["cms.access"] : [];
}
