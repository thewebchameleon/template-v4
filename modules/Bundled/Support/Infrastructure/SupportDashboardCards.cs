using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Dashboards;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Support;

public sealed class SupportDashboardCards(SupportDb db, SupportTicketContext tickets) : IDashboardCardProvider
{
    public IReadOnlyList<DashboardCardDefinition> Definitions { get; } = [
        new("support.tickets", "dashTickets", "support", ["compact", "small", "large"], ["metric", "chart", "list"], ["count"], ["all", "Open", "InProgress", "WaitingOnRequester", "Resolved", "Closed"], true),
        new("support.awaiting", "dashAwaitingReply", "support", ["compact", "small", "large"], ["metric", "list"], ["count"], ["all"], true),
        new("support.recent", "dashRecentTickets", "support", ["compact", "small", "large"], ["list", "metric"], ["count"], ["all", "Open", "InProgress", "WaitingOnRequester", "Resolved", "Closed"], true)];
    public async Task<bool> Available(Guid actor, string id, CancellationToken ct) => await tickets.Available(ct) && await tickets.Agent(ct);
    public async Task<DashboardCardData> Read(Guid actor, DashboardCardQuery q, DateTimeOffset? since, CancellationToken ct)
    {
        var source = tickets.Visible(true).AsNoTracking();
        if (q.Filter != "all") source = source.Where(x => x.Status == q.Filter);
        if (since != null) source = source.Where(x => x.CreatedAt >= since);
        if (q.DefinitionId == "support.awaiting") source = source.Where(x => x.Status != "Closed" && x.Status != "Resolved" && x.Status != "WaitingOnRequester" &&
            (!db.Set<SupportMessageRow>().Any(m => m.TicketId == x.Id && m.Kind == "reply" && !m.Internal) ||
            db.Set<SupportMessageRow>().Where(m => m.TicketId == x.Id && m.Kind == "reply" && !m.Internal).OrderByDescending(m => m.At).ThenByDescending(m => m.Id).Select(m => m.AuthorId).FirstOrDefault() == x.RequesterId));
        return new(await source.CountAsync(ct), "count",
            await source.GroupBy(x => x.Status).Select(g => new DashboardPoint(g.Key, g.Count())).ToArrayAsync(ct),
            await source.OrderByDescending(x => x.UpdatedAt).ThenBy(x => x.Id).Take(q.Limit).Select(x => new DashboardItem(x.Subject, x.Status, "/support/" + x.Id)).ToArrayAsync(ct));
    }
}
