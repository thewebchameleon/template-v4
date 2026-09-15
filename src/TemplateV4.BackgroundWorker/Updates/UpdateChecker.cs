using TemplateV4.Infrastructure.Updates;

namespace TemplateV4.BackgroundWorker;

public sealed class UpdateChecker(IServiceScopeFactory scopes, TimeProvider time, ILogger<UpdateChecker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = scopes.CreateAsyncScope();
                var store = scope.ServiceProvider.GetRequiredService<UpdateStore>();
                if (await store.Due(stoppingToken))
                {
                    TemplateV4.Application.Platform.ComponentRelease[]? releases = null;
                    try { releases = await scope.ServiceProvider.GetRequiredService<UpdateFeedClient>().Fetch(stoppingToken); }
                    catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { return; }
                    catch (Exception) { logger.LogWarning("Release feed check deferred; feed unavailable or invalid."); }
                    await store.Record(releases, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { return; }
            catch (Exception) { logger.LogWarning("Release update scan deferred."); }
            await Task.Delay(TimeSpan.FromMinutes(5), time, stoppingToken);
        }
    }
}
