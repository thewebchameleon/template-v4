using System.Diagnostics;
using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Quartz;
using TemplateV4.Application;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.BackgroundWorker;

[DisallowConcurrentExecution]
public sealed class MaintenanceJob(FrameworkDb db, TimeProvider time, ILogger<MaintenanceJob> logger, BackgroundExecutionContext execution, CultureCatalog cultures, IConfiguration configuration) : IJob
{
    private static readonly ActivitySource Source = new("TemplateV4.Jobs");
    public async Task Execute(IJobExecutionContext context)
    {
        ActivityContext.TryParse(ReadString(context.MergedJobDataMap, "traceparent"), null, out var parent);
        using var activity = Source.StartActivity("maintenance", ActivityKind.Internal, parent);
        execution.Culture = ReadString(context.MergedJobDataMap, "culture") ?? cultures.DefaultCulture;
        execution.TraceParent = activity?.Id;
        var originalCulture = CultureInfo.CurrentCulture;
        var originalUiCulture = CultureInfo.CurrentUICulture;
        CultureInfo.CurrentCulture = CultureInfo.CurrentUICulture = new CultureInfo(execution.Culture);
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(context.CancellationToken); timeout.CancelAfter(TimeSpan.FromSeconds(30));
        var ct = timeout.Token;
        var now = time.GetUtcNow();
        var attempt = int.TryParse(ReadString(context.MergedJobDataMap, "attempt"), out var parsedAttempt) ? parsedAttempt : 0;
        Guid? runId = context.JobDetail.Key.Group == "requests" && Guid.TryParse(context.JobDetail.Key.Name, out var parsedId) ? parsedId : null;
        if (runId is not null)
        {
            await using var claim = await db.Database.BeginTransactionAsync(ct);
            var run = await db.JobRuns.FromSqlInterpolated($"SELECT * FROM messaging.job_runs WHERE \"Id\" = {runId.Value} FOR UPDATE").SingleOrDefaultAsync(ct);
            if (run is null || run.State is "Completed" or "Failed" || run.State == "Running" && run.LeaseUntil > now) return;
            if (run.Attempts >= 4) { run.State = "Failed"; run.ErrorCode = "job.recovery_exhausted"; await db.SaveChangesAsync(ct); await claim.CommitAsync(ct); return; }
            run.Attempts++; attempt = run.Attempts; run.State = "Running"; run.LeaseUntil = now.AddMinutes(2);
            execution.ActorId = run.ActorId;
            await db.SaveChangesAsync(ct); await claim.CommitAsync(ct);
        }
        var retention = Math.Clamp(configuration.GetValue("Maintenance:RetentionDays", 7), 1, 90);
        try
        {
            await using var transaction = await db.Database.BeginTransactionAsync(ct);
            // Distinct durable request identities still share a single maintenance lock.
            await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842002)", ct);
            await db.Idempotency.Where(x => x.ExpiresAt < now).ExecuteDeleteAsync(ct);
            await db.Sessions.Where(x => x.ExpiresAt < now.AddDays(-retention)).ExecuteDeleteAsync(ct);
            await db.Outbox.Where(x => x.CompletedAt < now.AddDays(-retention)).ExecuteDeleteAsync(ct);
            await db.Inbox.Where(x => x.CompletedAt < now.AddDays(-90)).ExecuteDeleteAsync(ct);
            await db.AuthChallenges.Where(x => x.ExpiresAt < now).ExecuteDeleteAsync(ct);
            await db.RateBuckets.Where(x => x.ExpiresAt < now).ExecuteDeleteAsync(ct);
            if (runId is not null)
            {
                var run = await db.JobRuns.SingleAsync(x => x.Id == runId, ct); run.State = "Completed"; run.CompletedAt = time.GetUtcNow(); run.LeaseUntil = null;
            }
            db.Audit.Add(new() { Action = "job.maintenance.completed", SubjectId = runId, ActorId = execution.ActorId, At = now, TraceParent = activity?.Id });
            if (execution.ActorId is { } actor && await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct))
                db.Notifications.Add(new() { UserId = actor, Kind = "notificationJobCompleted", Link = "/operations", CreatedAt = now });
            await db.SaveChangesAsync(ct); await transaction.CommitAsync(ct);
            context.Result = new JobOutcome(true, "maintenance.completed", attempt, now, time.GetUtcNow());
        }
        catch (Exception exception) when (!context.CancellationToken.IsCancellationRequested)
        {
            logger.LogError("Maintenance failed: {ErrorType}", exception.GetType().Name);
            context.Result = new JobOutcome(false, exception.GetType().Name, attempt, now, time.GetUtcNow());
            db.ChangeTracker.Clear();
            using var recoveryTimeout = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            try
            {
                if (runId is not null)
                {
                    var run = await db.JobRuns.SingleAsync(x => x.Id == runId, recoveryTimeout.Token);
                    if (run.Attempts != attempt || run.State == "Completed") return;
                    run.State = attempt >= 4 ? "Failed" : "Retry"; run.LeaseUntil = null; run.ErrorCode = exception.GetType().Name;
                    run.AvailableAt = time.GetUtcNow().AddSeconds(15 * Math.Pow(2, attempt) + Random.Shared.Next(1, 10));
                }
                db.Audit.Add(new() { Action = "job.maintenance.failed", SubjectId = runId, ActorId = execution.ActorId, At = time.GetUtcNow(), TraceParent = activity?.Id });
                await db.SaveChangesAsync(recoveryTimeout.Token);
            }
            catch (Exception recoveryException) { logger.LogError("Job recovery failed: {ErrorType}", recoveryException.GetType().Name); }
            throw new JobExecutionException("Maintenance failed; inspect audit and telemetry.") { RefireImmediately = false };
        }
        finally { CultureInfo.CurrentCulture = originalCulture; CultureInfo.CurrentUICulture = originalUiCulture; }
    }
    public static string? ReadString(JobDataMap data, string key) => data.TryGetValue(key, out var value) ? value as string : null;
}
public sealed record JobOutcome(bool Succeeded, string Code, int Attempt, DateTimeOffset StartedAt, DateTimeOffset CompletedAt);
