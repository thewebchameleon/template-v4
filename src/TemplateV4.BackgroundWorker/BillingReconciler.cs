using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Billing;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.BackgroundWorker;

public sealed class BillingReconciler(IServiceScopeFactory scopes, TimeProvider time, ILogger<BillingReconciler> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scan = scopes.CreateAsyncScope();
                var ids = await scan.ServiceProvider.GetRequiredService<FrameworkDb>().Set<SubscriptionRow>().Where(x => x.OrderId != null && x.NextCheckAt <= time.GetUtcNow()).OrderBy(x => x.NextCheckAt).Take(50).Select(x => x.CustomerId).ToArrayAsync(stoppingToken);
                foreach (var id in ids)
                {
                    try { await using var scope = scopes.CreateAsyncScope(); await scope.ServiceProvider.GetRequiredService<BillingStore>().Reconcile(id, stoppingToken); }
                    catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { return; }
                    catch (Exception) { logger.LogWarning("Billing reconciliation deferred for customer {CustomerId}; provider or persistence unavailable.", id); }
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { return; }
            catch (Exception) { logger.LogWarning("Billing reconciliation scan deferred."); }
            await Task.Delay(TimeSpan.FromMinutes(1), time, stoppingToken);
        }
    }
}
