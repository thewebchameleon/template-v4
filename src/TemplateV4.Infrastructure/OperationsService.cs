using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application;
using TemplateV4.Infrastructure.Persistence;
namespace TemplateV4.Infrastructure;

public sealed record DeliverySummary(Guid Id, string Type, string State, int Attempts, DateTimeOffset AvailableAt, string? ErrorCode);
public sealed record DeliveryPage(IReadOnlyList<DeliverySummary> Items, int Total, int PageNumber, int PageSize, string Kind);
public sealed record ReplayRequest(Guid Id, string Kind);
public sealed record OperationsOverview(int PendingMessages, int FailedMessages, int ActiveJobs, int FailedJobs, double OldestMessageSeconds, DateTimeOffset? LastMaintenanceAt, string Version, DateTimeOffset CheckedAt, int BacklogWarningSeconds);
public sealed class OperationsService(FrameworkDb db, TimeProvider time, IConfiguration config)
{
    public async Task<OperationsOverview> Overview(CancellationToken ct)
    {
        var messages = await db.Outbox.Where(x => x.CompletedAt == null).GroupBy(x => 1).Select(g => new
        {
            Pending = g.Count(x => x.PoisonedAt == null),
            Failed = g.Count(x => x.PoisonedAt != null),
            Oldest = g.Where(x => x.PoisonedAt == null).Min(x => (DateTimeOffset?)x.CreatedAt)
        }).SingleOrDefaultAsync(ct);
        var jobCounts = await db.JobRuns.Where(x => x.State != "Completed").GroupBy(x => 1)
            .Select(g => new { Active = g.Count(x => x.State != "Failed"), Failed = g.Count(x => x.State == "Failed") }).SingleOrDefaultAsync(ct);
        var pending = messages?.Pending ?? 0; var failed = messages?.Failed ?? 0; var oldest = messages?.Oldest;
        var jobs = jobCounts?.Active ?? 0; var failedJobs = jobCounts?.Failed ?? 0;
        var maintenance = await db.Audit.Where(x => x.Action == "job.maintenance.completed").MaxAsync(x => (DateTimeOffset?)x.At, ct);
        return new(pending, failed, jobs, failedJobs, oldest is null ? 0 : Math.Max(0, (time.GetUtcNow() - oldest.Value).TotalSeconds), maintenance,
            config["Deployment:Version"] ?? typeof(OperationsService).Assembly.GetName().Version?.ToString() ?? "unknown", time.GetUtcNow(), Math.Clamp(config.GetValue("Operations:BacklogWarningSeconds", 300), 60, 86400));
    }
    public async Task<Result<DeliveryPage>> List(string kind, int pageNumber, int pageSize, bool failedOnly, string sort, string direction, CancellationToken ct)
    {
        if (kind is not ("message" or "job") || pageNumber < 1 || pageSize is < 1 or > 100 || pageNumber > int.MaxValue / pageSize || sort is not ("type" or "state" or "errorCode" or "attempts" or "availableAt") || direction is not ("asc" or "desc"))
            return Result<DeliveryPage>.Fail("validation.failed", ErrorKind.Validation);

        if (kind == "message")
        {
            var query = db.Outbox.AsNoTracking().Where(x => x.CompletedAt == null);
            if (failedOnly) query = query.Where(x => x.PoisonedAt != null);
            var total = await query.CountAsync(ct);
            var descending = direction == "desc";
            var ordered = sort switch
            {
                "type" when descending => query.OrderByDescending(x => x.Type).ThenByDescending(x => x.Id),
                "type" => query.OrderBy(x => x.Type).ThenBy(x => x.Id),
                "state" when descending => query.OrderByDescending(x => x.PoisonedAt != null ? "Failed" : x.LeaseId != null ? "Running" : "Pending").ThenByDescending(x => x.Id),
                "state" => query.OrderBy(x => x.PoisonedAt != null ? "Failed" : x.LeaseId != null ? "Running" : "Pending").ThenBy(x => x.Id),
                "errorCode" when descending => query.OrderByDescending(x => x.LastErrorCode).ThenByDescending(x => x.Id),
                "errorCode" => query.OrderBy(x => x.LastErrorCode).ThenBy(x => x.Id),
                "attempts" when descending => query.OrderByDescending(x => x.Attempts).ThenByDescending(x => x.Id),
                "attempts" => query.OrderBy(x => x.Attempts).ThenBy(x => x.Id),
                _ when descending => query.OrderByDescending(x => x.AvailableAt).ThenByDescending(x => x.Id),
                _ => query.OrderBy(x => x.AvailableAt).ThenBy(x => x.Id)
            };
            var items = await ordered.Skip((pageNumber - 1) * pageSize).Take(pageSize)
                .Select(x => new DeliverySummary(x.Id, x.Type, x.PoisonedAt != null ? "Failed" : x.LeaseId != null ? "Running" : "Pending", x.Attempts, x.AvailableAt, x.LastErrorCode)).ToArrayAsync(ct);
            return Result<DeliveryPage>.Success(new(items, total, pageNumber, pageSize, kind));
        }

        var jobs = db.JobRuns.AsNoTracking().Where(x => x.State != "Completed");
        if (failedOnly) jobs = jobs.Where(x => x.State == "Failed");
        var jobTotal = await jobs.CountAsync(ct);
        var jobDescending = direction == "desc";
        var orderedJobs = sort switch
        {
            "state" when jobDescending => jobs.OrderByDescending(x => x.State).ThenByDescending(x => x.Id),
            "state" => jobs.OrderBy(x => x.State).ThenBy(x => x.Id),
            "errorCode" when jobDescending => jobs.OrderByDescending(x => x.ErrorCode).ThenByDescending(x => x.Id),
            "errorCode" => jobs.OrderBy(x => x.ErrorCode).ThenBy(x => x.Id),
            "attempts" when jobDescending => jobs.OrderByDescending(x => x.Attempts).ThenByDescending(x => x.Id),
            "attempts" => jobs.OrderBy(x => x.Attempts).ThenBy(x => x.Id),
            "availableAt" when jobDescending => jobs.OrderByDescending(x => x.AvailableAt).ThenByDescending(x => x.Id),
            "availableAt" => jobs.OrderBy(x => x.AvailableAt).ThenBy(x => x.Id),
            _ when jobDescending => jobs.OrderByDescending(x => x.Id),
            _ => jobs.OrderBy(x => x.Id)
        };
        var jobItems = await orderedJobs.Skip((pageNumber - 1) * pageSize).Take(pageSize)
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
        db.Audit.Add(new() { ActorId = actor, SubjectId = request.Id, Action = "operations.replayed", SubjectType = "operation", MetadataJson = System.Text.Json.JsonSerializer.Serialize(new Dictionary<string, string> { ["kind"] = request.Kind }), At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
