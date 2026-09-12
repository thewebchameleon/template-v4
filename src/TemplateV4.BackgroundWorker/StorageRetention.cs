using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.BackgroundWorker;

public sealed class StorageRetention(IServiceScopeFactory scopes, ILogger<StorageRetention> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(10));
        do
        {
            try
            {
                await using var scope = scopes.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
                var storage = scope.ServiceProvider.GetRequiredService<IFileStorage>();
                var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
                var now = scope.ServiceProvider.GetRequiredService<TimeProvider>().GetUtcNow();
                using var timeout = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken); timeout.CancelAfter(TimeSpan.FromSeconds(30));
                var ct = timeout.Token;
                await using var tx = await db.Database.BeginTransactionAsync(ct);
                // A distinct lock serializes cleanup across replicas; deletion is idempotent after crashes.
                var locked = await db.Database.SqlQueryRaw<bool>("SELECT pg_try_advisory_xact_lock(74842003) AS \"Value\"").SingleAsync(ct);
                if (!locked) continue;
                var cutoff = now.AddDays(-Math.Clamp(config.GetValue("Privacy:DeletedFileRetentionDays", 30), 1, 365));
                var files = await db.Files.Where(x => x.PurgedAt == null && (x.DeletedAt < cutoff || !x.Ready && x.CreatedAt < now.AddDays(-1))).OrderBy(x => x.CreatedAt).Take(20).ToArrayAsync(ct);
                foreach (var file in files)
                {
                    if (!file.IsFolder) await storage.Delete(file.Id.ToString("N"), ct);
                    file.PurgedAt = now; file.DeletedAt ??= now; file.Name = "Deleted file";
                    db.Audit.Add(new() { SubjectId = file.Id, Action = "file.purged", At = now });
                }
                var notificationCutoff = now.AddDays(-Math.Clamp(config.GetValue("Privacy:NotificationRetentionDays", 90), 7, 365));
                var organizationFiles = await db.Set<TemplateV4.Infrastructure.Storage.OrganizationFileRow>().Where(x => x.PurgedAt == null && (x.DeletedAt < cutoff || !x.Ready && x.CreatedAt < now.AddDays(-1))).OrderBy(x => x.CreatedAt).Take(20).ToArrayAsync(ct);
                foreach (var file in organizationFiles)
                {
                    await storage.Delete(TemplateV4.Infrastructure.Storage.OrganizationFileRow.Key(file.CustomerId, file.Id), ct);
                    file.PurgedAt = now; file.DeletedAt ??= now; file.Name = "Deleted file";
                    db.Audit.Add(new() { SubjectId = file.CustomerId, Action = "customer.file_purged", At = now });
                }
                await db.Set<CustomerInviteRow>().Where(x => x.ExpiresAt < now).ExecuteDeleteAsync(ct);
                await db.Notifications.Where(x => x.CreatedAt < notificationCutoff).ExecuteDeleteAsync(ct);
                await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception exception) { logger.LogError("Storage retention failed: {ErrorType}", exception.GetType().Name); }
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
