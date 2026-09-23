using System.IO.Compression;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class FileStorageService
{
    private const int MaximumBatchSize = 500;

    public async Task<Result<Unit>> DeleteBatch(Guid actor, FileSelectionRequest request, CancellationToken ct)
    {
        var selected = Selection(request.Ids);
        if (selected is null) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Session.BeginTransactionAsync(ct); await Lock(actor, ct);
        if (!await CanWrite(actor, ct)) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var entries = await db.Files.AsNoTracking().Where(x => x.PurgedAt == null && !x.PurgeRequested).ToArrayAsync(ct);
        var roots = entries.Where(x => selected.Contains(x.Id) && x.Ready && x.DeletedAt == null).ToArray();
        if (roots.Length != selected.Count) return Result.Fail("files.not_found", ErrorKind.NotFound);
        var ids = roots.SelectMany(root => Descendants(entries, root.Id)).ToHashSet();
        var now = time.GetUtcNow();
        var batch = Guid.NewGuid();
        await db.Files.Where(x => ids.Contains(x.Id) && x.DeletedAt == null).ExecuteUpdateAsync(s => s.SetProperty(x => x.DeletedAt, now).SetProperty(x => x.TrashBatchId, batch), ct);
        await db.Set<FileStorageShare>().Where(x => ids.Contains(x.FileId)).ExecuteDeleteAsync(ct);
        foreach (var root in roots) Audit(actor, root.Id, "deleted");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }

    public async Task<Result<Unit>> MoveBatch(Guid actor, FileBatchDestinationRequest request, CancellationToken ct)
    {
        var selected = Selection(request.Ids);
        if (selected is null) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Session.BeginTransactionAsync(ct); await Lock(actor, ct);
        if (!await CanWrite(actor, ct)) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var entries = await db.Files.AsNoTracking().Where(x => x.Ready && x.DeletedAt == null && x.PurgedAt == null && !x.PurgeRequested).ToArrayAsync(ct);
        var roots = SelectionRoots(entries, selected);
        if (roots.Length == 0 || roots.SelectMany(x => Descendants(entries, x.Id)).Any(id => id == request.ParentId) || !await FolderExists(actor, request.ParentId, ct))
            return Result.Fail("files.invalid_move", ErrorKind.Validation);
        var moving = roots.Where(x => x.ParentId != request.ParentId).ToArray();
        var movingIds = moving.Select(x => x.Id).ToHashSet();
        var names = entries.Where(x => x.ParentId == request.ParentId && !movingIds.Contains(x.Id)).Select(x => x.Name).ToList();
        foreach (var root in moving)
        {
            var name = UniqueMoveName(root.Name, root.IsFolder, names);
            names.Add(name);
            await db.Files.Where(x => x.Id == root.Id).ExecuteUpdateAsync(s => s.SetProperty(x => x.ParentId, request.ParentId).SetProperty(x => x.Name, name).SetProperty(x => x.UpdatedAt, time.GetUtcNow()), ct);
            Audit(actor, root.Id, "moved");
        }
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }

    public async Task<Result<Unit>> CopyBatch(Guid actor, FileBatchDestinationRequest request, CancellationToken ct)
    {
        var selected = Selection(request.Ids);
        if (selected is null) return Result.Fail("validation.failed", ErrorKind.Validation);
        StoredFile[] sources;
        List<(StoredFile Source, StoredFile Copy)> copies;
        await using (var reserve = await db.Session.BeginTransactionAsync(ct))
        {
            await Lock(actor, ct);
            if (!await CanWrite(actor, ct)) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
            var entries = await db.Files.AsNoTracking().Where(x => x.Ready && x.DeletedAt == null && x.PurgedAt == null && !x.PurgeRequested).ToArrayAsync(ct);
            var roots = SelectionRoots(entries, selected);
            if (roots.Length == 0 || !await FolderExists(actor, request.ParentId, ct)) return Result.Fail("files.not_found", ErrorKind.NotFound);
            var copyIds = roots.SelectMany(x => Descendants(entries, x.Id)).ToHashSet();
            sources = entries.Where(x => copyIds.Contains(x.Id)).ToArray();
            var bytes = sources.Where(x => !x.IsFolder).Sum(x => x.Size);
            if (!await storageQuota.Fits(0, bytes, ct)) return Result.Fail("files.quota", ErrorKind.Conflict);
            var now = time.GetUtcNow();
            var map = sources.ToDictionary(x => x.Id, _ => Guid.NewGuid());
            var rootIds = roots.Select(x => x.Id).ToHashSet();
            var names = entries.Where(x => x.ParentId == request.ParentId).Select(x => x.Name).ToList();
            copies = [];
            foreach (var source in sources.OrderBy(x => Depth(x, entries)))
            {
                var root = rootIds.Contains(source.Id);
                var name = root ? UniqueMoveName(source.Name, source.IsFolder, names) : source.Name;
                if (root) names.Add(name);
                var copy = new StoredFile
                {
                    Id = map[source.Id], OwnerId = actor, ParentId = root ? request.ParentId : map[source.ParentId!.Value],
                    IsFolder = source.IsFolder, Name = name,
                    Important = source.Important, Starred = source.Starred, ContentType = source.ContentType,
                    Size = source.Size, CreatedAt = now, UpdatedAt = now, Ready = false
                };
                copies.Add((source, copy)); db.Files.Add(copy);
            }
            await db.SaveChangesAsync(ct); await reserve.CommitAsync(ct);
        }
        foreach (var pair in copies.Where(x => !x.Source.IsFolder))
        {
            await using var content = await storage.Read(pair.Source.ObjectKey, ct);
            await storage.Write(pair.Copy.ObjectKey, content, ct);
        }
        await using var finish = await db.Session.BeginTransactionAsync(ct);
        await Lock(actor, ct);
        if (!await CanWrite(actor, ct)) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var ids = copies.Select(x => x.Copy.Id).ToArray();
        await db.Files.Where(x => ids.Contains(x.Id)).ExecuteUpdateAsync(s => s.SetProperty(x => x.Ready, true), ct);
        var copiedBySource = copies.ToDictionary(x => x.Source.Id, x => x.Copy.Id);
        foreach (var root in SelectionRoots(sources, selected)) Audit(actor, copiedBySource[root.Id], "copied");
        await db.SaveChangesAsync(ct); await finish.CommitAsync(ct); return Result.Success();
    }

    public async Task<Result<FileDownload>> DownloadBatch(Guid actor, FileSelectionRequest request, CancellationToken ct)
    {
        var selected = Selection(request.Ids);
        if (selected is null || !await Active(actor, ct)) return Result<FileDownload>.Fail("files.not_found", ErrorKind.NotFound);
        var entries = await db.Files.AsNoTracking().Where(x => x.Ready && x.DeletedAt == null && x.PurgedAt == null && !x.PurgeRequested).ToArrayAsync(ct);
        var roots = SelectionRoots(entries, selected);
        if (roots.Length == 0) return Result<FileDownload>.Fail("files.not_found", ErrorKind.NotFound);
        var archive = TemporaryUpload();
        try
        {
            using (var zip = new ZipArchive(archive, ZipArchiveMode.Create, true))
            {
                var paths = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                foreach (var root in roots)
                {
                    var descendants = Descendants(entries, root.Id);
                    var rootPath = UniqueArchivePath(root.Name + (root.IsFolder ? "/" : ""), paths);
                    if (!root.IsFolder)
                    {
                        var item = zip.CreateEntry(rootPath, CompressionLevel.Fastest);
                        await CopyToArchive(root, item, ct);
                        continue;
                    }
                    zip.CreateEntry(rootPath);
                    foreach (var entry in entries.Where(x => x.Id != root.Id && descendants.Contains(x.Id)).OrderBy(x => Depth(x, entries)))
                    {
                        var path = rootPath + ArchiveRelativePath(entry, root, entries) + (entry.IsFolder ? "/" : "");
                        if (entry.IsFolder)
                        {
                            paths.Add(path);
                            zip.CreateEntry(path);
                            continue;
                        }
                        paths.Add(path);
                        var item = zip.CreateEntry(path, CompressionLevel.Fastest);
                        await CopyToArchive(entry, item, ct);
                    }
                }
            }
            archive.Position = 0;
            var name = roots.Length == 1 && roots[0].IsFolder ? $"{roots[0].Name}.zip" : "files.zip";
            return Result<FileDownload>.Success(new(archive, name));
        }
        catch { await archive.DisposeAsync(); throw; }
    }

    private static HashSet<Guid>? Selection(Guid[]? ids) => ids is { Length: > 0 and <= MaximumBatchSize } && ids.Distinct().Count() == ids.Length ? ids.ToHashSet() : null;
    private static StoredFile[] SelectionRoots(StoredFile[] entries, HashSet<Guid> selected)
    {
        var byId = entries.ToDictionary(x => x.Id);
        if (selected.Any(id => !byId.ContainsKey(id))) return [];
        return selected.Select(id => byId[id]).Where(entry =>
        {
            var parent = entry.ParentId;
            while (parent is { } id && byId.TryGetValue(id, out var ancestor))
            {
                if (selected.Contains(id)) return false;
                parent = ancestor.ParentId;
            }
            return true;
        }).ToArray();
    }
    private static int Depth(StoredFile entry, StoredFile[] entries)
    {
        var byId = entries.ToDictionary(x => x.Id); var depth = 0; var parent = entry.ParentId;
        while (parent is { } id && byId.TryGetValue(id, out var value)) { depth++; parent = value.ParentId; }
        return depth;
    }
    private async Task CopyToArchive(StoredFile file, ZipArchiveEntry entry, CancellationToken ct)
    {
        await using var source = await storage.Read(file.ObjectKey, ct);
        await using var destination = entry.Open();
        await source.CopyToAsync(destination, ct);
    }
    private static string ArchiveRelativePath(StoredFile entry, StoredFile root, StoredFile[] entries)
    {
        var byId = entries.ToDictionary(x => x.Id); var parts = new Stack<string>(); var current = entry;
        parts.Push(current.Name);
        while (current.ParentId is { } parent && parent != root.Id && byId.TryGetValue(parent, out current)) parts.Push(current.Name);
        return string.Join('/', parts);
    }
    private static string UniqueArchivePath(string path, HashSet<string> paths)
    {
        if (paths.Add(path)) return path;
        var folder = path.EndsWith('/'); var value = folder ? path.TrimEnd('/') : path;
        var extension = folder ? "" : Path.GetExtension(value); var stem = extension.Length == value.Length ? value : value[..^extension.Length];
        for (var index = 1; ; index++) { var candidate = $"{stem} ({index}){extension}{(folder ? "/" : "")}"; if (paths.Add(candidate)) return candidate; }
    }
}
