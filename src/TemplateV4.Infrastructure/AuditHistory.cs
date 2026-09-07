using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure;

public sealed class AuditHistory(FrameworkDb db) : IAuditHistory
{
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
            "actorName" when descending => source.OrderByDescending(x => db.Profiles.Where(p => p.Id == x.ActorId).Select(p => p.DisplayName).FirstOrDefault() ?? db.Roles.Where(r => r.Id == x.ActorId).Select(r => r.Name).FirstOrDefault()).ThenByDescending(x => x.Id),
            "actorName" => source.OrderBy(x => db.Profiles.Where(p => p.Id == x.ActorId).Select(p => p.DisplayName).FirstOrDefault() ?? db.Roles.Where(r => r.Id == x.ActorId).Select(r => r.Name).FirstOrDefault()).ThenBy(x => x.Id),
            "subjectName" when descending => source.OrderByDescending(x => db.Profiles.Where(p => p.Id == x.SubjectId).Select(p => p.DisplayName).FirstOrDefault() ?? db.Roles.Where(r => r.Id == x.SubjectId).Select(r => r.Name).FirstOrDefault()).ThenByDescending(x => x.Id),
            "subjectName" => source.OrderBy(x => db.Profiles.Where(p => p.Id == x.SubjectId).Select(p => p.DisplayName).FirstOrDefault() ?? db.Roles.Where(r => r.Id == x.SubjectId).Select(r => r.Name).FirstOrDefault()).ThenBy(x => x.Id),
            _ when descending => source.OrderByDescending(x => x.At).ThenByDescending(x => x.Id),
            _ => source.OrderBy(x => x.At).ThenBy(x => x.Id)
        };
        var entries = await ordered.Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize)
            .Select(x => new AuditItem(
                x.Id,
                x.ActorId,
                x.ActorId == null ? null : db.Profiles.Where(p => p.Id == x.ActorId).Select(p => p.DisplayName).FirstOrDefault() ?? db.Roles.Where(r => r.Id == x.ActorId).Select(r => r.Name).FirstOrDefault(),
                x.SubjectId,
                x.SubjectId == null ? null : db.Profiles.Where(p => p.Id == x.SubjectId).Select(p => p.DisplayName).FirstOrDefault() ?? db.Roles.Where(r => r.Id == x.SubjectId).Select(r => r.Name).FirstOrDefault(),
                x.Action,
                x.At)).ToArrayAsync(ct);
        return new(entries, total, query.PageNumber, query.PageSize);
    }
}
