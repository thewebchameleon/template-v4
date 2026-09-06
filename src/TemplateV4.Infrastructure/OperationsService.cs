using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;
using TemplateV4.Infrastructure.Persistence;
namespace TemplateV4.Infrastructure;

public sealed record DeliverySummary(Guid Id, string Type, string State, int Attempts, DateTimeOffset AvailableAt, string? ErrorCode);
public sealed record DeliveryPage(IReadOnlyList<DeliverySummary> Items, int Total, int PageNumber, int PageSize, string Kind);
public sealed record ReplayRequest(Guid Id, string Kind);
public sealed class OperationsService(FrameworkDb db, TimeProvider time)
{
    public async Task<Result<DeliveryPage>> List(string kind, int pageNumber, int pageSize, bool failedOnly, CancellationToken ct)
    {
        if (kind is not ("message" or "job") || pageNumber < 1 || pageSize is < 1 or > 100 || pageNumber > int.MaxValue / pageSize)
            return Result<DeliveryPage>.Fail("validation.failed", ErrorKind.Validation);

        if (kind == "message")
        {
            var query = db.Outbox.AsNoTracking().Where(x => x.CompletedAt == null);
            if (failedOnly) query = query.Where(x => x.PoisonedAt != null);
            var total = await query.CountAsync(ct);
            var items = await query.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id)
                .Skip((pageNumber - 1) * pageSize).Take(pageSize)
                .Select(x => new DeliverySummary(x.Id, x.Type, x.PoisonedAt != null ? "Failed" : x.LeaseId != null ? "Running" : "Pending", x.Attempts, x.AvailableAt, x.LastErrorCode)).ToArrayAsync(ct);
            return Result<DeliveryPage>.Success(new(items, total, pageNumber, pageSize, kind));
        }

        var jobs = db.JobRuns.AsNoTracking().Where(x => x.State != "Completed");
        if (failedOnly) jobs = jobs.Where(x => x.State == "Failed");
        var jobTotal = await jobs.CountAsync(ct);
        var jobItems = await jobs.OrderBy(x => x.AvailableAt).ThenBy(x => x.Id)
            .Skip((pageNumber - 1) * pageSize).Take(pageSize)
            .Select(x => new DeliverySummary(x.Id, "job", x.State, x.Attempts, x.AvailableAt, x.ErrorCode)).ToArrayAsync(ct);
        return Result<DeliveryPage>.Success(new(jobItems, jobTotal, pageNumber, pageSize, kind));
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
