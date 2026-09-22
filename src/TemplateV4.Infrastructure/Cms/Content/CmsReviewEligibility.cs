using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Cms;

// Does not depend on the CMS store: action-item composition must not form a DI cycle.
public sealed class CmsReviewEligibility(FrameworkDb db) : ISystemActionEligibility
{
    public string Source => "Cms";
    public async Task<Guid[]> EligibleSources(Guid actor, CancellationToken ct)
    {
        var roles = db.UserRoles.Where(x => x.UserId == actor).Select(x => x.RoleId);
        var permissions = db.RoleClaims.Where(x => roles.Contains(x.RoleId) && x.ClaimType == "permission").Select(x => x.ClaimValue);
        var global = await permissions.ContainsAsync(Permissions.CmsReview, ct);
        var grants = db.Set<ContentGrantRow>().Where(x => roles.Contains(x.RoleId) && x.Permission == Permissions.CmsReview).Select(x => x.Collection);
        return await (from review in db.Set<ContentReviewRow>()
                      join revision in db.Set<ContentRevisionRow>() on review.RevisionId equals revision.Id
                      join item in db.Set<ContentItemRow>() on revision.ItemId equals item.Id
                      where review.ReviewerId == actor && (global || grants.Contains(item.Collection))
                      select review.Id).ToArrayAsync(ct);
    }
}
