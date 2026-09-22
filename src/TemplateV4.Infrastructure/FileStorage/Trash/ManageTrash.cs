using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class FileStorageService
{
    public async Task<Result<Unit>> EmptyTrash(Guid actor, CancellationToken ct)
    {
        StoredFile[] files;
        await using (var claim = await db.Database.BeginTransactionAsync(ct))
        {
            await Lock(actor, ct);
            if (!await CanWrite(actor, ct)) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
            files = await db.Files.AsNoTracking().Where(x => x.PurgedAt == null && x.DeletedAt != null).ToArrayAsync(ct);
            var ids = files.Select(x => x.Id).ToArray();
            await db.Files.Where(x => ids.Contains(x.Id)).ExecuteUpdateAsync(s => s
                .SetProperty(x => x.PurgeRequested, true)
                .SetProperty(x => x.PurgeRetryAt, (DateTimeOffset?)null), ct);
            await db.Set<FileStorageShare>().Where(x => ids.Contains(x.FileId)).ExecuteDeleteAsync(ct);
            Audit(actor, actor, "purge_requested");
            await db.SaveChangesAsync(ct);
            await claim.CommitAsync(ct);
        }

        foreach (var file in files.Where(x => !x.IsFolder)) await storage.Delete(file.ObjectKey, ct);

        await using var finish = await db.Database.BeginTransactionAsync(ct);
        await Lock(actor, ct);
        var purgedAt = time.GetUtcNow();
        var fileIds = files.Select(x => x.Id).ToArray();
        await db.Files.Where(x => fileIds.Contains(x.Id) && x.PurgedAt == null && x.PurgeRequested)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.PurgedAt, purgedAt)
                .SetProperty(x => x.Name, "Deleted file")
                .SetProperty(x => x.Description, "")
                .SetProperty(x => x.Tags, "")
                .SetProperty(x => x.PurgeRetryAt, (DateTimeOffset?)null), ct);
        await finish.CommitAsync(ct);
        return Result.Success();
    }

    public async Task<Result<Unit>> Trash(Guid actor, Guid? id, bool restore, bool purge, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(actor, ct);
        if (!await CanWrite(actor, ct)) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var entries = await db.Files.AsNoTracking().Where(x => x.PurgedAt == null && !x.PurgeRequested).ToArrayAsync(ct);
        var root = entries.SingleOrDefault(x => x.Id == id);
        if (id != null && (root is null || restore && root.DeletedAt == null || purge && root.DeletedAt == null)) return Result.Fail("files.not_found", ErrorKind.NotFound);
        if (id == null && !purge) return Result.Fail("validation.failed", ErrorKind.Validation);
        var ids = id is null ? entries.Where(x => x.DeletedAt != null).Select(x => x.Id).ToHashSet() : Descendants(entries, id.Value);
        if (restore)
        {
            ids.IntersectWith(entries.Where(x => x.DeletedAt != null && x.TrashBatchId == root!.TrashBatchId).Select(x => x.Id));
            if (root!.ParentId is { } parent && !await FolderExists(actor, parent, ct)) await db.Files.Where(x => x.Id == id).ExecuteUpdateAsync(s => s.SetProperty(x => x.ParentId, (Guid?)null), ct);
            await db.Files.Where(x => ids.Contains(x.Id)).ExecuteUpdateAsync(s => s.SetProperty(x => x.DeletedAt, (DateTimeOffset?)null).SetProperty(x => x.TrashBatchId, (Guid?)null).SetProperty(x => x.UpdatedAt, time.GetUtcNow()), ct);
        }
        else if (purge) await db.Files.Where(x => ids.Contains(x.Id) && x.DeletedAt != null).ExecuteUpdateAsync(s => s.SetProperty(x => x.PurgeRequested, true), ct);
        else
        {
            var batch = Guid.NewGuid();
            await db.Files.Where(x => ids.Contains(x.Id) && x.DeletedAt == null).ExecuteUpdateAsync(s => s.SetProperty(x => x.DeletedAt, time.GetUtcNow()).SetProperty(x => x.TrashBatchId, batch), ct);
            await db.Set<FileStorageShare>().Where(x => ids.Contains(x.FileId)).ExecuteDeleteAsync(ct);
        }
        Audit(actor, id ?? actor, restore ? "restored" : purge ? "purge_requested" : "deleted");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
