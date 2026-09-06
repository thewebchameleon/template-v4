using Microsoft.EntityFrameworkCore;
using Quartz;
using TemplateV4.Infrastructure.Persistence;
namespace TemplateV4.BackgroundWorker;

public sealed class JobReconciler(IServiceScopeFactory scopes, ISchedulerFactory schedulers, ILogger<JobReconciler> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try { await Reconcile(ct); }
            catch (OperationCanceledException) when (ct.IsCancellationRequested) { break; }
            catch (Exception error) { logger.LogError("Job reconciliation failed: {ErrorType}", error.GetType().Name); }
            await Task.Delay(TimeSpan.FromSeconds(10), ct);
        }
    }
    public async Task Reconcile(CancellationToken ct)
    {
        await using var scope = scopes.CreateAsyncScope(); var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
        var now = scope.ServiceProvider.GetRequiredService<TimeProvider>().GetUtcNow();
        var scheduler = await schedulers.GetScheduler(ct);
        var runs = await db.JobRuns.AsNoTracking().Where(x => (x.State == "Pending" || x.State == "Retry" || x.State == "Running" && x.LeaseUntil < now) && x.AvailableAt <= now).OrderBy(x => x.AvailableAt).Take(100).ToArrayAsync(ct);
        foreach (var run in runs)
        {
            var key = new JobKey(run.Id.ToString("N"), "requests");
            var trigger = TriggerBuilder.Create().WithIdentity($"{run.Id:N}-{run.Attempts}", "requests").ForJob(key).StartNow().WithSimpleSchedule(x => x.WithMisfireHandlingInstructionFireNow()).Build();
            try
            {
                if (!await scheduler.CheckExists(key, ct))
                    await scheduler.ScheduleJob(JobBuilder.Create<MaintenanceJob>().WithIdentity(key).StoreDurably().RequestRecovery().UsingJobData("culture", run.Culture).UsingJobData("traceparent", run.TraceParent ?? "").Build(), trigger, ct);
                else if ((await scheduler.GetTriggersOfJob(key, ct)).Count == 0) await scheduler.ScheduleJob(trigger, ct);
            }
            catch (ObjectAlreadyExistsException) { /* Another replica reconciled the same request. */ }
        }
        var retired = await db.JobRuns.Where(x => x.CompletedAt < now.AddDays(-7)).OrderBy(x => x.CompletedAt).Take(100).ToArrayAsync(ct);
        foreach (var run in retired) { await scheduler.DeleteJob(new JobKey(run.Id.ToString("N"), "requests"), ct); db.JobRuns.Remove(run); }
        await db.SaveChangesAsync(ct);
    }
}
