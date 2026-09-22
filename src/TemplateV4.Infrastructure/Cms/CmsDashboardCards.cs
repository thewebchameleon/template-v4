using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Dashboards;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Dashboards;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Cms;

public sealed class CmsDashboardCards(FrameworkDb db, ICapabilities capabilities, TemplateV4.Application.Cms.IContentCms content) : IDashboardCardProvider
{
    public IReadOnlyList<DashboardCardDefinition> Definitions { get; } = [new("cms.drafts", "dashCmsDrafts", "cms", ["compact", "small", "large"], ["metric", "list"], ["count"], ["all"], true)];
    public async Task<bool> Available(Guid actor, string id, CancellationToken ct) => await capabilities.Enabled(CapabilityIds.Cms, ct) && (await content.Collections(ct)).Value?.Length > 0;
    public async Task<DashboardCardData> Read(Guid actor, DashboardCardQuery q, DateTimeOffset? since, CancellationToken ct)
    {
        var collections = (await content.Collections(ct)).Value ?? [];
        var keys = collections.Where(x => x.Actions.Any(p => p != Permissions.CmsSchema)).Select(x => x.Key).ToArray();
        var source = db.Set<ContentItemRow>().AsNoTracking().Where(x => keys.Contains(x.Collection) && (x.PublishedRevisionId == null || x.PublishedRevisionId != x.DraftRevisionId)).Where(x => since == null || x.UpdatedAt >= since);
        return new(await source.CountAsync(ct), "count", [], await source.OrderByDescending(x => x.UpdatedAt).ThenBy(x => x.Id).Take(q.Limit).Select(x => new DashboardItem(x.Title, "dashDraft", "/cms/collections/" + x.Collection + "/items/" + x.Id)).ToArrayAsync(ct));
    }
}
