using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure;

public sealed partial class ActionItemsService
{

    public async Task<Result<Unit>> Complete(Guid actor, Guid id, CancellationToken ct)
    {
        await using var tx = await db.Session.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", ct);
        var queues = await EligibleQueues(actor, ct);
        if (!await ActiveUsers.ContainsAsync(actor, ct)) return Result.Fail("auth.forbidden", ErrorKind.Forbidden);
        var changed = await db.Set<ActionItemRow>().Where(x => x.Id == id && x.Source == "Manual" && x.State == "Open" && (x.CreatorId == actor || x.AssigneeId == actor || x.QueueId != null && queues.Contains(x.QueueId)))
            .ExecuteUpdateAsync(x => x.SetProperty(a => a.State, "Completed").SetProperty(a => a.CompletedAt, time.GetUtcNow()).SetProperty(a => a.CompletedBy, actor), ct);
        if (changed != 1) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        db.Audit.Add(new() { ActorId = actor, SubjectId = id, Action = "action_item.completed", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
