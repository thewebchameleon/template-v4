using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure;

public sealed partial class ActionItemsService
{

    // Called inside the owning workflow transaction, so item, notification and source commit together.
    public async Task AddReview(string source, Guid sourceId, Guid subjectId, string title, string link, CancellationToken ct)
    {
        if (await db.Set<ActionItemRow>().AnyAsync(x => x.Source == source && x.SourceId == sourceId, ct)) return;
        var row = new ActionItemRow { Source = source, SourceId = sourceId, SubjectId = subjectId, Title = title, Link = link, QueueId = ActionQueues.ForSource(source), CreatedAt = time.GetUtcNow() };
        db.Add(row); await Notify(row, ct);
    }

    public async Task ResolveReview(string source, Guid sourceId, Guid actor, CancellationToken ct) =>
        await db.Set<ActionItemRow>().Where(x => x.Source == source && x.SourceId == sourceId && x.State == "Open").ExecuteUpdateAsync(x => x.SetProperty(a => a.State, "Completed").SetProperty(a => a.CompletedAt, time.GetUtcNow()).SetProperty(a => a.CompletedBy, actor), ct);
}
