using TemplateV4.Infrastructure.Licensing;

namespace TemplateV4.BackgroundWorker;

public sealed class LicenseRefresher(IServiceScopeFactory scopes, LicenseConfiguration configuration, TimeProvider time,
    ILogger<LicenseRefresher> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!configuration.Configured) return;
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = scopes.CreateAsyncScope();
                var signed = await scope.ServiceProvider.GetRequiredService<LicenseClient>().Refresh(stoppingToken);
                await scope.ServiceProvider.GetRequiredService<LicenseStore>().Record(signed, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { return; }
            catch (Exception) { logger.LogWarning("Deployment license refresh unavailable; existing expiry remains enforced."); }
            await Task.Delay(TimeSpan.FromMinutes(5), time, stoppingToken);
        }
    }
}
