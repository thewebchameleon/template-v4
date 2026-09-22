using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Dashboards;
using TemplateV4.Application.FileStorage;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Dashboards;

public sealed class CoreDashboardCards(FrameworkDb db, DashboardAccess access, IStorageUsage storage) : IDashboardCardProvider
{
    public IReadOnlyList<DashboardCardDefinition> Definitions { get; } = [
        new("core.actions", "dashActions", "core", ["small", "large"], ["metric", "list", "chart"], ["count"], ["all", "Open", "Completed"], true),
        new("core.reviews", "dashReviews", "core", ["small", "large"], ["metric", "list"], ["count"], ["all"], true),
        new("core.activity", "dashActivity", "core", ["small", "large"], ["list"], ["count"], ["all"], true),
        new("core.registrations", "dashRegistrations", "core", ["small", "large"], ["metric", "list"], ["count"], ["all"], true),
        new("core.privacy", "dashPrivacy", "core", ["small", "large"], ["metric", "list"], ["count"], ["all"], true),
        new("core.storage", "dashStorage", "core", ["small", "large"], ["metric"], ["count"], ["all"], false)];
    public Task<bool> Available(Guid actor, string id, CancellationToken ct) => id is "core.actions" or "core.activity" ? Task.FromResult(true) : access.Administrator(actor, ct);
    public async Task<DashboardCardData> Read(Guid actor, DashboardCardQuery q, DateTimeOffset? since, CancellationToken ct)
    {
        if (q.DefinitionId == "core.storage") return new(await storage.Read(ct) / 1048576m, "MiB", [], []);
        if (q.DefinitionId == "core.activity")
        {
            var audit = db.Audit.AsNoTracking().Where(x => x.ActorId == actor && (since == null || x.At >= since));
            return new(await audit.CountAsync(ct), "count", [], await audit.OrderByDescending(x => x.At).ThenBy(x => x.Id).Take(q.Limit).Select(x => new DashboardItem(x.Action, x.SubjectType ?? "", "/me")).ToArrayAsync(ct));
        }
        var source = db.Set<ActionItemRow>().AsNoTracking();
        if (q.DefinitionId == "core.actions") source = source.Where(x => x.AssigneeId == actor);
        else source = source.Where(x => x.QueueId != null && x.State == "Open");
        if (q.DefinitionId == "core.registrations") source = source.Where(x => x.QueueId == "registration-approvals");
        if (q.DefinitionId == "core.privacy") source = source.Where(x => x.QueueId == "privacy-reviews");
        if (q.Filter != "all") source = source.Where(x => x.State == q.Filter);
        if (since != null) source = source.Where(x => x.CreatedAt >= since);
        return new(await source.CountAsync(ct), "count",
            await source.GroupBy(x => x.State).Select(g => new DashboardPoint(g.Key, g.Count())).ToArrayAsync(ct),
            await source.OrderByDescending(x => x.CreatedAt).ThenBy(x => x.Id).Take(q.Limit).Select(x => new DashboardItem(x.Title, x.State, "/action-items")).ToArrayAsync(ct));
    }
}
