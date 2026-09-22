using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Dashboards;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Crm;

public sealed class CrmDashboardCards(FrameworkDb db, IOrganisationOperations access, ICapabilities capabilities) : IDashboardCardProvider
{
    public IReadOnlyList<DashboardCardDefinition> Definitions { get; } = [
        new("crm.pipeline", "dashPipeline", "crm", ["small", "large"], ["metric", "chart", "list"], ["count", "value"], ["all", "Open", "Won", "Lost"], true),
        new("crm.stages", "dashStages", "crm", ["small", "large"], ["chart", "list", "metric"], ["count", "value"], ["all", "Open", "Won", "Lost"], true),
        new("crm.recent", "dashCrmRecent", "crm", ["small", "large"], ["list", "metric"], ["count"], ["all", "Contact", "Company", "Deal"], true)];
    public async Task<bool> Available(Guid actor, string id, CancellationToken ct) => await capabilities.Enabled(CapabilityIds.Crm, ct) && await access.Allowed(actor, OrganisationOperation.Read, ct);
    public async Task<DashboardCardData> Read(Guid actor, DashboardCardQuery q, DateTimeOffset? since, CancellationToken ct)
    {
        var source = db.Set<CrmRecordRow>().AsNoTracking().Where(x => !x.Archived);
        if (q.DefinitionId != "crm.recent") source = source.Where(x => x.Kind == "Deal");
        if (q.Filter != "all") source = q.DefinitionId == "crm.recent" ? source.Where(x => x.Kind == q.Filter) : source.Where(x => x.Outcome == q.Filter);
        if (since != null) source = source.Where(x => x.CreatedAt >= since);
        var value = q.Metric == "value" ? await source.SumAsync(x => x.Value, ct) : await source.CountAsync(ct);
        DashboardPoint[] points;
        if (q.DefinitionId == "crm.stages")
        {
            var configuration = await db.Set<CrmConfigurationRow>().AsNoTracking().Select(x => x.Data).SingleOrDefaultAsync(ct);
            var stages = configuration == null ? [] : JsonSerializer.Deserialize<CrmConfiguration>(configuration, new JsonSerializerOptions(JsonSerializerDefaults.Web))!.Pipelines.SelectMany(p => p.Stages.Select(s => new { s.Id, Label = p.Label + " / " + s.Label })).ToArray();
            // Aggregate the owned JSON stage field in PostgreSQL without loading record payloads.
            var groups = await db.Database.SqlQuery<StageTotal>($"""
                SELECT ("Data" ->> 'stageId')::uuid AS "Stage", count(*)::int AS "Count", sum("Value") AS "Value"
                FROM crm.records WHERE NOT "Archived" AND "Kind" = 'Deal'
                    AND ({q.Filter} = 'all' OR "Outcome" = {q.Filter})
                    AND ({since}::timestamptz IS NULL OR "CreatedAt" >= {since})
                GROUP BY "Data" ->> 'stageId'
                """).ToArrayAsync(ct);
            points = groups.Select(g => new DashboardPoint(stages.FirstOrDefault(s => s.Id == g.Stage)?.Label ?? "dashUnassigned", q.Metric == "value" ? g.Value : g.Count)).ToArray();
        }
        else points = await source.GroupBy(x => x.Outcome).Select(g => new DashboardPoint(g.Key, q.Metric == "value" ? g.Sum(x => x.Value) : g.Count())).ToArrayAsync(ct);
        return new(value, q.Metric == "value" ? "ZAR" : "count", points,
            await source.OrderByDescending(x => x.UpdatedAt).ThenBy(x => x.Id).Take(q.Limit).Select(x => new DashboardItem(x.Name, x.Outcome, "/organisation/crm/" + x.Id)).ToArrayAsync(ct));
    }
    private sealed record StageTotal(Guid? Stage, int Count, decimal Value);
}
