using Microsoft.Extensions.Diagnostics.HealthChecks;
using Quartz;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.BackgroundWorker;

public sealed class WorkerReadiness(IServiceScopeFactory scopes, ISchedulerFactory schedulers) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        await using var scope = scopes.CreateAsyncScope();
        if (!await scope.ServiceProvider.GetRequiredService<FrameworkDb>().Database.CanConnectAsync(cancellationToken)) return HealthCheckResult.Unhealthy("Database unavailable.");
        var scheduler = await schedulers.GetScheduler(cancellationToken);
        var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
        var cutoff = DateTimeOffset.UtcNow.AddMinutes(-15);
        if (await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.AnyAsync(db.Outbox.Where(x => x.PoisonedAt != null || x.CompletedAt == null && x.CreatedAt < cutoff), cancellationToken)
            || await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.AnyAsync(db.JobRuns.Where(x => x.State == "Failed"), cancellationToken))
            return HealthCheckResult.Degraded("Delivery requires operator attention.");
        return scheduler.IsStarted && !scheduler.IsShutdown && !scheduler.InStandbyMode ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy("Scheduler unavailable.");
    }
}
