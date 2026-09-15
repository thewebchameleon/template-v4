using System.Diagnostics.Metrics;
using TemplateV4.Infrastructure;
namespace TemplateV4.BackgroundWorker;

public sealed class DeliveryMetrics(IServiceScopeFactory scopes, ILogger<DeliveryMetrics> logger) : BackgroundService
{
    private readonly Meter _meter = new("templatev4");
    private OperationsOverview? _snapshot;
    private long _lastSample;
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _meter.CreateObservableGauge("platform.delivery.pending", () => Volatile.Read(ref _snapshot)?.PendingMessages ?? 0);
        _meter.CreateObservableGauge("platform.delivery.failed", () => (Volatile.Read(ref _snapshot)?.FailedMessages ?? 0) + (Volatile.Read(ref _snapshot)?.FailedJobs ?? 0));
        _meter.CreateObservableGauge("platform.delivery.oldest_seconds", () => Volatile.Read(ref _snapshot)?.OldestMessageSeconds ?? 0);
        _meter.CreateObservableGauge("platform.jobs.active", () => Volatile.Read(ref _snapshot)?.ActiveJobs ?? 0);
        _meter.CreateObservableGauge("platform.delivery.sample_timestamp_seconds", () => Interlocked.Read(ref _lastSample));
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));
        do
        {
            try
            {
                await using var scope = scopes.CreateAsyncScope();
                using var timeout = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken); timeout.CancelAfter(TimeSpan.FromSeconds(10));
                var value = await scope.ServiceProvider.GetRequiredService<OperationsService>().Overview(timeout.Token);
                Volatile.Write(ref _snapshot, value); Interlocked.Exchange(ref _lastSample, value.CheckedAt.ToUnixTimeSeconds());
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception exception) { logger.LogWarning("Delivery metrics collection failed: {ErrorType}", exception.GetType().Name); }
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }
    public override void Dispose() { _meter.Dispose(); base.Dispose(); }
}
