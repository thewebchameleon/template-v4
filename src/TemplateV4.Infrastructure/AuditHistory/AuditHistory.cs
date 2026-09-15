using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure;

public sealed class AuditHistory(FrameworkDb db) : IAuditHistory
{
    public async Task<AuditDetail?> Detail(long id, CancellationToken ct)
    {
        var row = await db.Audit.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return null;
        var actorName = row.ActorNameSnapshot;
        var subjectName = row.SubjectNameSnapshot;
        if (row.SchemaVersion is null)
        {
            actorName = await db.Profiles.Where(x => x.Id == row.ActorId).Select(x => x.DisplayName).FirstOrDefaultAsync(ct);
            subjectName = await db.Profiles.Where(x => x.Id == row.SubjectId).Select(x => x.DisplayName).FirstOrDefaultAsync(ct)
                ?? await db.Roles.Where(x => x.Id == row.SubjectId).Select(x => x.Name).FirstOrDefaultAsync(ct);
        }
        return new(new(row.Id, row.ActorId, actorName, row.SubjectId, subjectName, row.Action, row.At), row.ActorType, row.SubjectType,
            row.Outcome, row.FailureCode, row.Source, row.Reason, row.TraceParent, row.SchemaVersion,
            JsonSerializer.Deserialize<AuditChange[]>(row.ChangesJson ?? "[]")!,
            JsonSerializer.Deserialize<AuditRelatedEntity[]>(row.RelatedEntitiesJson ?? "[]")!,
            JsonSerializer.Deserialize<Dictionary<string, string>>(row.MetadataJson ?? "{}")!);
    }
    public async Task<Page<AuditItem>> List(AuditQuery query, CancellationToken ct)
    {
        var source = db.Audit.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(query.Action)) source = source.Where(x => x.Action.Contains(query.Action));
        if (query.ActorId is not null) source = source.Where(x => x.ActorId == query.ActorId);
        if (query.SubjectId is not null) source = source.Where(x => x.SubjectId == query.SubjectId);
        if (query.From is not null) source = source.Where(x => x.At >= query.From);
        if (query.Until is not null) source = source.Where(x => x.At <= query.Until);
        var total = await source.CountAsync(ct);
        var descending = query.Direction == "desc";
        var ordered = query.Sort switch
        {
            "action" when descending => source.OrderByDescending(x => x.Action).ThenByDescending(x => x.Id),
            "action" => source.OrderBy(x => x.Action).ThenBy(x => x.Id),
            "actorName" when descending => source.OrderByDescending(x => (x.SchemaVersion != null ? x.ActorNameSnapshot : db.Profiles.Where(p => p.Id == x.ActorId).Select(p => p.DisplayName).FirstOrDefault() ?? db.Roles.Where(r => r.Id == x.ActorId).Select(r => r.Name).FirstOrDefault())).ThenByDescending(x => x.Id),
            "actorName" => source.OrderBy(x => (x.SchemaVersion != null ? x.ActorNameSnapshot : db.Profiles.Where(p => p.Id == x.ActorId).Select(p => p.DisplayName).FirstOrDefault() ?? db.Roles.Where(r => r.Id == x.ActorId).Select(r => r.Name).FirstOrDefault())).ThenBy(x => x.Id),
            "subjectName" when descending => source.OrderByDescending(x => (x.SchemaVersion != null ? x.SubjectNameSnapshot : db.Profiles.Where(p => p.Id == x.SubjectId).Select(p => p.DisplayName).FirstOrDefault() ?? db.Roles.Where(r => r.Id == x.SubjectId).Select(r => r.Name).FirstOrDefault())).ThenByDescending(x => x.Id),
            "subjectName" => source.OrderBy(x => (x.SchemaVersion != null ? x.SubjectNameSnapshot : db.Profiles.Where(p => p.Id == x.SubjectId).Select(p => p.DisplayName).FirstOrDefault() ?? db.Roles.Where(r => r.Id == x.SubjectId).Select(r => r.Name).FirstOrDefault())).ThenBy(x => x.Id),
            _ when descending => source.OrderByDescending(x => x.At).ThenByDescending(x => x.Id),
            _ => source.OrderBy(x => x.At).ThenBy(x => x.Id)
        };
        var entries = await ordered.Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize)
            .Select(x => new AuditItem(
                x.Id,
                x.ActorId,
                (x.SchemaVersion != null ? x.ActorNameSnapshot : db.Profiles.Where(p => p.Id == x.ActorId).Select(p => p.DisplayName).FirstOrDefault() ?? db.Roles.Where(r => r.Id == x.ActorId).Select(r => r.Name).FirstOrDefault()),
                x.SubjectId,
                (x.SchemaVersion != null ? x.SubjectNameSnapshot : db.Profiles.Where(p => p.Id == x.SubjectId).Select(p => p.DisplayName).FirstOrDefault() ?? db.Roles.Where(r => r.Id == x.SubjectId).Select(r => r.Name).FirstOrDefault()),
                x.Action,
                x.At)).ToArrayAsync(ct);
        return new(entries, total, query.PageNumber, query.PageSize);
    }
}
