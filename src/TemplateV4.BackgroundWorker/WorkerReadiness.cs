using Microsoft.Extensions.Diagnostics.HealthChecks;
using Quartz;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.BackgroundWorker;

public sealed class WorkerReadiness(IServiceScopeFactory scopes, ISchedulerFactory schedulers, TimeProvider time) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        await using var scope = scopes.CreateAsyncScope();
        if (!await scope.ServiceProvider.GetRequiredService<FrameworkDb>().Database.CanConnectAsync(cancellationToken)) return HealthCheckResult.Unhealthy("Database unavailable.");
        var scheduler = await schedulers.GetScheduler(cancellationToken);
        var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
        var now = time.GetUtcNow();
        var cutoff = now.AddSeconds(-Math.Clamp(scope.ServiceProvider.GetRequiredService<IConfiguration>().GetValue("Operations:BacklogWarningSeconds", 300), 60, 86400));
        if (await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.AnyAsync(db.Outbox.Where(x => x.PoisonedAt != null || x.CompletedAt == null && x.CreatedAt < cutoff), cancellationToken)
            || await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.AnyAsync(db.JobRuns.Where(x => x.State == "Failed" || x.State != "Completed" && x.AvailableAt < cutoff && (x.State != "Running" || x.LeaseUntil < now)), cancellationToken))
            return HealthCheckResult.Degraded("Delivery requires operator attention.");
        return scheduler.Status == SchedulerStatus.Running ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy("Scheduler unavailable.");
    }
}
