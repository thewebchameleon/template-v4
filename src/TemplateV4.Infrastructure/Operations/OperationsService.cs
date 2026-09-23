using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Updates;
namespace TemplateV4.Infrastructure;

public sealed record DeliverySummary(Guid Id, string Type, string State, int Attempts, DateTimeOffset AvailableAt, string? ErrorCode);
public sealed record DeliveryPage(IReadOnlyList<DeliverySummary> Items, int Total, int PageNumber, int PageSize, string Kind);
public sealed record ReplayRequest(Guid Id, string Kind);
public sealed record InstalledModule(string Id, string Version);
public sealed record OperationsOverview(int PendingMessages, int FailedMessages, int ActiveJobs, int FailedJobs, double OldestMessageSeconds, DateTimeOffset? LastMaintenanceAt, string Version, IReadOnlyList<InstalledModule> Modules, DateTimeOffset CheckedAt, int BacklogWarningSeconds);
public sealed record BackgroundJobSummary(string Id, string Status, string Schedule, DateTimeOffset? NextRunAt, DateTimeOffset? LastRunAt, string? LastRunState, int FailedRuns, Guid Version);
public sealed record BackgroundJobPage(IReadOnlyList<BackgroundJobSummary> Items, int Total, int PageNumber, int PageSize);
public sealed record BackgroundJobRun(Guid Id, string State, string Culture, int Attempts, DateTimeOffset AvailableAt, DateTimeOffset? CompletedAt, string? ErrorCode);
public sealed record BackgroundJobDetail(BackgroundJobSummary Job, IReadOnlyList<BackgroundJobRun> History, int RetentionDays, bool HasPayload);
public sealed record BackgroundJobPauseRequest(bool Paused, Guid Version);
public sealed class OperationsService(FrameworkDb db, TimeProvider time, IConfiguration config, UpdateConfiguration updates)
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
        var modules = updates.Installed.Components.Where(x => x.Id != "foundation")
            .OrderBy(x => x.Id, StringComparer.Ordinal).Select(x => new InstalledModule(x.Id, x.Version)).ToArray();
        return new(pending, failed, jobs, failedJobs, oldest is null ? 0 : Math.Max(0, (time.GetUtcNow() - oldest.Value).TotalSeconds), maintenance,
            typeof(OperationsService).Assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion ?? "unknown", modules, time.GetUtcNow(), Math.Clamp(config.GetValue("Operations:BacklogWarningSeconds", 300), 60, 86400));
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
        await using var tx = await db.Session.BeginTransactionAsync(ct);
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

    public async Task<Result<BackgroundJobPage>> ListBackgroundJobs(string search, string status, int pageNumber, int pageSize, string sort, string direction, CancellationToken ct)
    {
        if (pageNumber < 1 || pageSize is < 1 or > 100 || pageNumber > int.MaxValue / pageSize || status is not ("all" or "active" or "paused" or "failed") ||
            sort is not ("id" or "status" or "nextRunAt" or "lastRunAt" or "failedRuns") || direction is not ("asc" or "desc"))
            return Result<BackgroundJobPage>.Fail("validation.failed", ErrorKind.Validation);

        var item = await BackgroundJob("maintenance", ct);
        var matchesSearch = string.IsNullOrWhiteSpace(search) || "maintenance".Contains(search.Trim(), StringComparison.OrdinalIgnoreCase);
        var matchesStatus = status switch
        {
            "active" => item?.Status == "Active",
            "paused" => item?.Status == "Paused",
            "failed" => item?.FailedRuns > 0,
            _ => true
        };
        var items = item is not null && matchesSearch && matchesStatus ? new[] { item } : [];
        var descending = direction == "desc";
        var ordered = sort switch
        {
            "status" when descending => items.OrderByDescending(x => x.Status).ThenByDescending(x => x.Id),
            "status" => items.OrderBy(x => x.Status).ThenBy(x => x.Id),
            "nextRunAt" when descending => items.OrderByDescending(x => x.NextRunAt).ThenByDescending(x => x.Id),
            "nextRunAt" => items.OrderBy(x => x.NextRunAt).ThenBy(x => x.Id),
            "lastRunAt" when descending => items.OrderByDescending(x => x.LastRunAt).ThenByDescending(x => x.Id),
            "lastRunAt" => items.OrderBy(x => x.LastRunAt).ThenBy(x => x.Id),
            "failedRuns" when descending => items.OrderByDescending(x => x.FailedRuns).ThenByDescending(x => x.Id),
            "failedRuns" => items.OrderBy(x => x.FailedRuns).ThenBy(x => x.Id),
            _ when descending => items.OrderByDescending(x => x.Id),
            _ => items.OrderBy(x => x.Id)
        };
        return Result<BackgroundJobPage>.Success(new(ordered.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToArray(), items.Length, pageNumber, pageSize));
    }

    public async Task<Result<BackgroundJobDetail>> GetBackgroundJob(string id, CancellationToken ct)
    {
        var job = await BackgroundJob(id, ct);
        if (job is null) return Result<BackgroundJobDetail>.Fail("background_job.not_found", ErrorKind.NotFound);
        var history = await db.JobRuns.AsNoTracking().Where(x => x.DefinitionId == id)
            .OrderByDescending(x => x.AvailableAt).ThenByDescending(x => x.Id).Take(50)
            .Select(x => new BackgroundJobRun(x.Id, x.State, x.Culture, x.Attempts, x.AvailableAt, x.CompletedAt, x.ErrorCode)).ToArrayAsync(ct);
        return Result<BackgroundJobDetail>.Success(new(
            job,
            history,
            Math.Clamp(config.GetValue("Maintenance:RetentionDays", 7), 1, 90),
            false));
    }

    public async Task<Result<BackgroundJobSummary>> SetBackgroundJobPaused(Guid actor, string id, BackgroundJobPauseRequest request, CancellationToken ct)
    {
        var schedule = await db.BackgroundJobSchedules.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (schedule is null) return Result<BackgroundJobSummary>.Fail("background_job.not_found", ErrorKind.NotFound);
        if (schedule.Version != request.Version) return Result<BackgroundJobSummary>.Fail("background_job.conflict", ErrorKind.Conflict);
        schedule.Paused = request.Paused;
        schedule.NextRunAt = request.Paused ? null : schedule.NextRunAt;
        schedule.UpdatedAt = time.GetUtcNow();
        schedule.UpdatedBy = actor;
        schedule.Version = Guid.NewGuid();
        db.Audit.Add(new() { ActorId = actor, SubjectType = "background-job", SubjectId = null, Action = request.Paused ? "job.schedule.paused" : "job.schedule.resumed", MetadataJson = System.Text.Json.JsonSerializer.Serialize(new Dictionary<string, string> { ["id"] = id }), At = time.GetUtcNow() });
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateConcurrencyException) { return Result<BackgroundJobSummary>.Fail("background_job.conflict", ErrorKind.Conflict); }
        return Result<BackgroundJobSummary>.Success((await BackgroundJob(id, ct))!);
    }

    public async Task<Result<Unit>> RetryBackgroundJob(Guid actor, string id, Guid runId, CancellationToken ct)
    {
        await using var tx = await db.Session.BeginTransactionAsync(ct);
        var run = await db.JobRuns.FromSqlInterpolated($"SELECT * FROM messaging.job_runs WHERE \"Id\" = {runId} FOR UPDATE").SingleOrDefaultAsync(ct);
        if (run is null || run.DefinitionId != id) return Result.Fail("background_job.not_found", ErrorKind.NotFound);
        if (run.State != "Failed") return Result.Fail("operations.not_replayable", ErrorKind.Conflict);
        run.State = "Retry"; run.Attempts = 0; run.AvailableAt = time.GetUtcNow(); run.LeaseUntil = null; run.CompletedAt = null; run.ErrorCode = null;
        db.Audit.Add(new() { ActorId = actor, SubjectId = runId, SubjectType = "background-job-run", Action = "job.run.retried", MetadataJson = System.Text.Json.JsonSerializer.Serialize(new Dictionary<string, string> { ["id"] = id }), At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }

    private async Task<BackgroundJobSummary?> BackgroundJob(string id, CancellationToken ct)
    {
        if (id != "maintenance") return null;
        var schedule = await db.BackgroundJobSchedules.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        if (schedule is null) return null;
        var last = await db.JobRuns.AsNoTracking().Where(x => x.DefinitionId == id)
            .OrderByDescending(x => x.AvailableAt).ThenByDescending(x => x.Id)
            .Select(x => new { x.AvailableAt, x.State }).FirstOrDefaultAsync(ct);
        var failed = await db.JobRuns.AsNoTracking().CountAsync(x => x.DefinitionId == id && x.State == "Failed", ct);
        return new(id, schedule.Paused ? "Paused" : "Active", config["Maintenance:Cron"] ?? "0 0 2 * * ?", schedule.NextRunAt, last == null ? null : last.AvailableAt, last?.State, failed, schedule.Version);
    }
}
