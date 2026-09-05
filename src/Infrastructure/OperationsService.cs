using Microsoft.EntityFrameworkCore;
using templatev4.Application;
using templatev4.Infrastructure.Persistence;
namespace templatev4.Infrastructure;

public sealed record DeliverySummary(Guid Id, string Type, string State, int Attempts, DateTimeOffset AvailableAt, string? ErrorCode);
public sealed record ReplayRequest(Guid Id, string Kind);
public sealed class OperationsService(FrameworkDb db, TimeProvider time)
{
    public async Task<DeliverySummary[]> List(CancellationToken ct)
    {
        var messages = await db.Outbox.AsNoTracking().Where(x => x.CompletedAt == null).OrderBy(x => x.CreatedAt).Take(100)
            .Select(x => new DeliverySummary(x.Id, x.Type, x.PoisonedAt != null ? "Failed" : x.LeaseId != null ? "Running" : "Pending", x.Attempts, x.AvailableAt, x.LastErrorCode)).ToArrayAsync(ct);
        var jobs = await db.JobRuns.AsNoTracking().Where(x => x.State != "Completed").OrderBy(x => x.AvailableAt).Take(100)
            .Select(x => new DeliverySummary(x.Id, "job", x.State, x.Attempts, x.AvailableAt, x.ErrorCode)).ToArrayAsync(ct);
        return messages.Concat(jobs).ToArray();
    }
    public async Task<Result<Unit>> Replay(Guid actor, ReplayRequest request, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        if (request.Kind == "job")
        {
            var job = await db.JobRuns.FromSqlInterpolated($"SELECT * FROM messaging.job_runs WHERE \"Id\" = {request.Id} FOR UPDATE").SingleOrDefaultAsync(ct);
            if (job is null || job.State != "Failed") return Result.Fail("operations.not_replayable", ErrorKind.Conflict);
            job.State = "Retry"; job.Attempts = 0; job.AvailableAt = time.GetUtcNow(); job.LeaseUntil = null; job.ErrorCode = null;
        }
        else if (request.Kind == "message")
        {
            var message = await db.Outbox.FromSqlInterpolated($"SELECT * FROM messaging.outbox WHERE \"Id\" = {request.Id} FOR UPDATE").SingleOrDefaultAsync(ct);
            if (message is null || message.PoisonedAt is null || message.CompletedAt is not null) return Result.Fail("operations.not_replayable", ErrorKind.Conflict);
            message.PoisonedAt = null; message.Attempts = 0; message.AvailableAt = time.GetUtcNow(); message.LeaseId = null; message.LeaseUntil = null;
        }
        else return Result.Fail("validation.failed", ErrorKind.Validation);
        db.Audit.Add(new() { ActorId = actor, SubjectId = request.Id, Action = "operations.replayed", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
