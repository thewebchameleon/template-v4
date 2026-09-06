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
        var entries = await source.OrderByDescending(x => x.At).ThenByDescending(x => x.Id).Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize).ToArrayAsync(ct);
        var ids = entries.SelectMany(x => new[] { x.ActorId, x.SubjectId }).Where(x => x != null).Select(x => x!.Value).Distinct().ToArray();
        var names = await db.Profiles.AsNoTracking().Where(x => ids.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.DisplayName, ct);
        return new(entries.Select(x => new AuditItem(x.Id, x.ActorId, x.ActorId is { } a ? names.GetValueOrDefault(a) : null, x.SubjectId, x.SubjectId is { } s ? names.GetValueOrDefault(s) : null, x.Action, x.At)).ToArray(), total, query.PageNumber, query.PageSize);
    }
}
