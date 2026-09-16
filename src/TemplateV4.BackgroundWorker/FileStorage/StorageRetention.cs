using TemplateV4.Infrastructure.Storage;

namespace TemplateV4.BackgroundWorker;

public sealed class StorageRetention(IServiceScopeFactory scopes, ILogger<StorageRetention> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Parallel.ForEachAsync(Enumerable.Range(0, 4), new ParallelOptions { MaxDegreeOfParallelism = 4, CancellationToken = stoppingToken }, async (_, ct) =>
                {
                    await using var scope = scopes.CreateAsyncScope();
                    await scope.ServiceProvider.GetRequiredService<FileRetention>().Run(ct);
                });
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { return; }
            catch (Exception exception) { logger.LogError("Storage retention failed: {ErrorType}", exception.GetType().Name); }
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
