using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Dashboards;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Dashboards;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Cms;

public sealed class CmsDashboardCards(FrameworkDb db, DashboardAccess access, ICapabilities capabilities) : IDashboardCardProvider
{
    public IReadOnlyList<DashboardCardDefinition> Definitions { get; } = [new("cms.drafts", "dashCmsDrafts", "cms", ["small", "large"], ["metric", "list"], ["count"], ["all"], true)];
    public async Task<bool> Available(Guid actor, string id, CancellationToken ct) => await capabilities.Enabled(CapabilityIds.Cms, ct) && await access.Has(actor, Permissions.CmsEdit, ct);
    public async Task<DashboardCardData> Read(Guid actor, DashboardCardQuery q, DateTimeOffset? since, CancellationToken ct)
    {
        var source = db.Set<ArticleRow>().AsNoTracking().Where(x => !x.Published || x.Draft != x.PublishedContent).Where(x => since == null || x.UpdatedAt >= since);
        return new(await source.CountAsync(ct), "count", [], await source.OrderByDescending(x => x.UpdatedAt).ThenBy(x => x.Id).Take(q.Limit).Select(x => new DashboardItem(x.Title, "dashDraft", "/cms/" + x.Id)).ToArrayAsync(ct));
    }
}
