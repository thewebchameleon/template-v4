using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed record RetentionBacklog(int Count, DateTimeOffset? OldestCreatedAt);

public sealed class FileRetention(FrameworkDb db, IFileStorage storage, IConfiguration config, TimeProvider time, ILogger<FileRetention> logger)
{
    public async Task<RetentionBacklog> Run(CancellationToken ct)
    {
        var now = time.GetUtcNow();
        var cutoff = now.AddDays(-Math.Clamp(config.GetValue("Privacy:DeletedFileRetentionDays", 30), 1, 365));
        var abandoned = now.AddDays(-1);
        var personal = db.Files.Where(x => x.PurgedAt == null && (x.PurgeRequested || x.DeletedAt < cutoff || !x.Ready && x.CreatedAt < abandoned));
        // Independent housekeeping commits even if every object provider call fails.
        var notificationCutoff = now.AddDays(-Math.Clamp(config.GetValue("Privacy:NotificationRetentionDays", 90), 7, 365));
        await db.Notifications.Where(x => x.CreatedAt < notificationCutoff).ExecuteDeleteAsync(ct);
        var batch = Math.Clamp(config.GetValue("Privacy:FilePurgeBatchSize", 100), 1, 1000);
        await ClaimDemoExpiry(now, batch, ct);
        var ids = await personal.Where(x => x.PurgeRetryAt == null || x.PurgeRetryAt <= now).OrderBy(x => x.CreatedAt).ThenBy(x => x.Id).Take(batch).Select(x => x.Id).ToArrayAsync(ct);
        foreach (var id in ids)
        {
            // Publish an irreversible purge decision before touching object storage. A crash or
            // partial provider failure must never leave a partly removed entry restorable.
            await using (var claim = await db.Database.BeginTransactionAsync(ct))
            {
                await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({TemplateV4.Application.Customers.Organisation.Id.ToString()}, 0))", ct);
                var claimed = await db.Files.Where(x => x.Id == id && x.PurgedAt == null && (x.PurgeRequested || x.DeletedAt < cutoff || !x.Ready && x.CreatedAt < abandoned))
                    .ExecuteUpdateAsync(s => s.SetProperty(x => x.PurgeRequested, true).SetProperty(x => x.DeletedAt, x => x.DeletedAt ?? now), ct);
                if (claimed == 0) continue;
                await claim.CommitAsync(ct);
            }
            await using var tx = await db.Database.BeginTransactionAsync(ct);
            await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({TemplateV4.Application.Customers.Organisation.Id.ToString()}, 0))", ct);
            var row = await db.Files.FromSqlInterpolated($"SELECT * FROM files.files WHERE \"Id\" = {id} FOR UPDATE SKIP LOCKED").SingleOrDefaultAsync(ct);
            if (row != null) await db.Entry(row).ReloadAsync(ct);
            if (row is null || row.PurgedAt != null || row.PurgeRetryAt > now || !(row.PurgeRequested || row.DeletedAt < cutoff || !row.Ready && row.CreatedAt < abandoned)) continue;
            var removed = true;
            if (!row.IsFolder)
            {
                if (!await Delete(row.ObjectKey, ct)) removed = false;
            }
            if (removed)
            {
                row.PurgedAt = now; row.DeletedAt ??= now; row.Name = "Deleted file"; row.Description = ""; row.Tags = ""; row.PurgeRetryAt = null;
                await db.Set<MyFileShare>().Where(x => x.FileId == id).ExecuteDeleteAsync(ct);
                db.Audit.Add(new() { SubjectId = row.Id, Action = "file.purged", At = now });
            }
            else row.PurgeRetryAt = now.AddHours(1);
            await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); db.ChangeTracker.Clear();
        }
        var dates = personal.Select(x => (DateTimeOffset?)x.CreatedAt);
        var backlog = new RetentionBacklog(await dates.CountAsync(ct), await dates.MinAsync(ct));
        if (backlog.Count > 0) logger.LogWarning("File retention backlog: {Count}; oldest object created at {OldestCreatedAt}", backlog.Count, backlog.OldestCreatedAt);
        return backlog;
    }
    private async Task ClaimDemoExpiry(DateTimeOffset now, int batch, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var settings = await db.FileStorageSettings.FromSqlRaw("SELECT * FROM files.file_storage_settings WHERE \"Id\" = 1 FOR UPDATE").AsNoTracking().SingleAsync(ct);
        var cutoff = now.AddMinutes(-settings.DemoExpiryMinutes);
        if (!settings.DemoMode || settings.DemoStartedAt is null || settings.DemoStartedAt > cutoff) return;
        // max(CreatedAt, DemoStartedAt) gives each new item its own lifetime and
        // restarts all existing timers without rewriting file creation timestamps.
        var eligible = db.Files.Where(x => x.PurgedAt == null && !x.PurgeRequested && x.CreatedAt <= cutoff &&
            (!x.IsFolder || !db.Files.Any(child => child.ParentId == x.Id && child.PurgedAt == null)));
        var candidates = await eligible.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id).Take(batch).Select(x => new { x.Id, x.OwnerId }).ToArrayAsync(ct);
        // Folder mutations and retention share the organisation library lock.
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({TemplateV4.Application.Customers.Organisation.Id.ToString()}, 0))", ct);
        var ids = candidates.Select(x => x.Id).ToArray();
        await eligible.Where(x => ids.Contains(x.Id)).ExecuteUpdateAsync(s => s.SetProperty(x => x.PurgeRequested, true).SetProperty(x => x.DeletedAt, x => x.DeletedAt ?? now), ct);
        await tx.CommitAsync(ct);
    }
    private async Task<bool> Delete(string key, CancellationToken ct)
    {
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
        timeout.CancelAfter(TimeSpan.FromSeconds(65));
        try { await storage.Delete(key, timeout.Token); return true; }
        catch (OperationCanceledException) when (ct.IsCancellationRequested) { throw; }
        catch (Exception exception) { logger.LogWarning("Object purge deferred: {ErrorType}", exception.GetType().Name); return false; }
    }
}
