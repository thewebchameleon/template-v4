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
        var personal = db.Files.Where(x => x.PurgedAt == null && (x.DeletedAt < cutoff || !x.Ready && x.CreatedAt < abandoned));
        var organizations = db.Set<OrganizationFileRow>().Where(x => x.PurgedAt == null && (x.DeletedAt < cutoff || !x.Ready && x.CreatedAt < abandoned));
        // Independent housekeeping commits even if every object provider call fails.
        await db.Set<CustomerInviteRow>().Where(x => x.ExpiresAt < now).ExecuteDeleteAsync(ct);
        var notificationCutoff = now.AddDays(-Math.Clamp(config.GetValue("Privacy:NotificationRetentionDays", 90), 7, 365));
        await db.Notifications.Where(x => x.CreatedAt < notificationCutoff).ExecuteDeleteAsync(ct);
        var batch = Math.Clamp(config.GetValue("Privacy:FilePurgeBatchSize", 100), 1, 1000);
        var ids = await personal.Where(x => x.PurgeRetryAt == null || x.PurgeRetryAt <= now).OrderBy(x => x.CreatedAt).ThenBy(x => x.Id).Take(batch).Select(x => x.Id).ToArrayAsync(ct);
        foreach (var id in ids)
        {
            await using var tx = await db.Database.BeginTransactionAsync(ct);
            var row = await db.Files.FromSqlInterpolated($"SELECT * FROM files.files WHERE \"Id\" = {id} FOR UPDATE SKIP LOCKED").SingleOrDefaultAsync(ct);
            if (row is null || row.PurgedAt != null || row.PurgeRetryAt > now || !(row.DeletedAt < cutoff || !row.Ready && row.CreatedAt < abandoned)) continue;
            if (row.IsFolder || await Delete(row.Id.ToString("N"), ct))
            {
                row.PurgedAt = now; row.DeletedAt ??= now; row.Name = "Deleted file"; row.PurgeRetryAt = null;
                db.Audit.Add(new() { SubjectId = row.Id, Action = "file.purged", At = now });
            }
            else row.PurgeRetryAt = now.AddHours(1);
            await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); db.ChangeTracker.Clear();
        }
        ids = await organizations.Where(x => x.PurgeRetryAt == null || x.PurgeRetryAt <= now).OrderBy(x => x.CreatedAt).ThenBy(x => x.Id).Take(batch).Select(x => x.Id).ToArrayAsync(ct);
        foreach (var id in ids)
        {
            await using var tx = await db.Database.BeginTransactionAsync(ct);
            var row = await db.Set<OrganizationFileRow>().FromSqlInterpolated($"SELECT * FROM files.organization_files WHERE \"Id\" = {id} FOR UPDATE SKIP LOCKED").SingleOrDefaultAsync(ct);
            if (row is null || row.PurgedAt != null || row.PurgeRetryAt > now || !(row.DeletedAt < cutoff || !row.Ready && row.CreatedAt < abandoned)) continue;
            if (await Delete(OrganizationFileRow.Key(row.CustomerId, row.Id), ct))
            {
                row.PurgedAt = now; row.DeletedAt ??= now; row.Name = "Deleted file"; row.PurgeRetryAt = null;
                db.Audit.Add(new() { SubjectId = row.CustomerId, Action = "customer.file_purged", At = now });
            }
            else row.PurgeRetryAt = now.AddHours(1);
            await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); db.ChangeTracker.Clear();
        }
        var dates = personal.Select(x => (DateTimeOffset?)x.CreatedAt).Concat(organizations.Select(x => (DateTimeOffset?)x.CreatedAt));
        var backlog = new RetentionBacklog(await dates.CountAsync(ct), await dates.MinAsync(ct));
        if (backlog.Count > 0) logger.LogWarning("File retention backlog: {Count}; oldest object created at {OldestCreatedAt}", backlog.Count, backlog.OldestCreatedAt);
        return backlog;
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
