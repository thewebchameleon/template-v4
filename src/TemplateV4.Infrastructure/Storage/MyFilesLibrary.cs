using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed record FileUsageSegment(string Category, long Bytes, int Count);
public sealed record FileMetadataRequest(string Name, string Description, string Tags, bool Important, bool Starred);
public sealed record FileMoveRequest(Guid? ParentId);
public sealed record FileShareRequest(string? Email, string Permission, DateTimeOffset? ExpiresAt);
public sealed record FileShareItem(Guid Id, string? Recipient, string Permission, DateTimeOffset? ExpiresAt, string? Token = null);

public sealed partial class MyFilesService
{
    public static string Category(string name) => Path.GetExtension(name).ToLowerInvariant() switch
    {
        ".png" or ".jpg" or ".jpeg" or ".gif" or ".webp" or ".svg" or ".avif" or ".bmp" or ".heic" or ".tiff" => "images",
        ".pdf" or ".doc" or ".docx" or ".odt" or ".txt" or ".rtf" or ".md" => "documents",
        ".xls" or ".xlsx" or ".csv" or ".ods" or ".tsv" => "spreadsheets",
        ".ppt" or ".pptx" or ".odp" => "presentations",
        ".mp4" or ".mov" or ".webm" or ".mkv" or ".avi" => "video",
        ".mp3" or ".wav" or ".ogg" or ".flac" or ".m4a" or ".aac" => "audio",
        ".zip" or ".7z" or ".rar" or ".tar" or ".gz" => "archives",
        _ => "other"
    };
    private async Task<long> Used(Guid owner, CancellationToken ct) =>
        await db.Files.Where(x => x.OwnerId == owner && x.PurgedAt == null).SumAsync(x => x.Size, ct);
    private static HashSet<Guid> Descendants(IEnumerable<StoredFile> files, Guid id)
    {
        var children = files.ToLookup(x => x.ParentId);
        var ids = new HashSet<Guid> { id }; var queue = new Queue<Guid>(); queue.Enqueue(id);
        while (queue.TryDequeue(out var parent)) foreach (var child in children[parent]) if (ids.Add(child.Id)) queue.Enqueue(child.Id);
        return ids;
    }
    private async Task<string?> Permission(Guid actor, StoredFile file, CancellationToken ct, string? token = null)
    {
        if (!await Active(file.OwnerId, ct)) return null;
        if (token is null && file.OwnerId == actor) return "owner";
        var ancestors = new HashSet<Guid> { file.Id }; var parent = file.ParentId;
        while (parent is { } id && ancestors.Add(id))
        {
            var row = await db.Files.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.Ready && x.DeletedAt == null && !x.PurgeRequested, ct);
            if (row is null) return null;
            parent = row.ParentId;
        }
        var now = time.GetUtcNow();
        var shares = db.Set<MyFileShare>().Where(x => ancestors.Contains(x.FileId) && (x.ExpiresAt == null || x.ExpiresAt > now));
        if (token != null)
        {
            if (token.Length != 64) return null;
            var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
            return await shares.AnyAsync(x => x.TokenHash == hash, ct) ? "viewer" : null;
        }
        var permissions = await shares.Where(x => x.RecipientId == actor).Select(x => x.Permission).ToArrayAsync(ct);
        return permissions.Contains("editor") ? "editor" : permissions.Length > 0 ? "viewer" : null;
    }
    private async Task<StoredFile?> Access(Guid actor, Guid id, bool edit, CancellationToken ct, string? token = null)
    {
        var file = await db.Files.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.Ready && x.DeletedAt == null && x.PurgedAt == null && !x.PurgeRequested, ct);
        if (file is null) return null;
        var permission = await Permission(actor, file, ct, token);
        return permission != null && (!edit || permission is "owner" or "editor") ? file : null;
    }
    private void Audit(Guid actor, Guid id, string action) => db.Audit.Add(new() { ActorId = actor, SubjectId = id, Action = "file." + action, At = time.GetUtcNow() });
    public async Task<Result<FilePage>> List(Guid actor, int pageNumber, int pageSize, string? search, string sort, string direction, CancellationToken ct, Guid? parentId = null, string group = "my-files", string? token = null)
    {
        if (pageNumber is < 1 or > 10000 || pageSize is < 1 or > 100 || search is { Length: > 120 } || sort is not ("name" or "size" or "createdAt" or "updatedAt") || direction is not ("asc" or "desc") || group is not ("my-files" or "important" or "shared" or "recent" or "starred" or "trash")) return Result<FilePage>.Fail("validation.failed", ErrorKind.Validation);
        if (token is null && !await db.Profiles.AnyAsync(x => x.Id == actor, ct)) return Result<FilePage>.Fail("files.not_found", ErrorKind.NotFound);
        StoredFile? folder = null;
        if (parentId != null)
        {
            folder = group == "trash" && token == null ? await db.Files.AsNoTracking().SingleOrDefaultAsync(x => x.Id == parentId && x.OwnerId == actor && x.DeletedAt != null && x.PurgedAt == null && !x.PurgeRequested, ct) : await Access(actor, parentId.Value, false, ct, token);
            if (folder is null || !folder.IsFolder) return Result<FilePage>.Fail("files.not_found", ErrorKind.NotFound);
        }
        var now = time.GetUtcNow();
        IQueryable<StoredFile> all = db.Files.AsNoTracking().Where(x => x.Ready && x.PurgedAt == null && !x.PurgeRequested);
        if (token != null)
        {
            if (folder is null) return Result<FilePage>.Fail("files.not_found", ErrorKind.NotFound);
            all = all.Where(x => x.OwnerId == folder.OwnerId && x.DeletedAt == null);
        }
        else if (group == "shared")
        {
            var roots = await db.Set<MyFileShare>().Where(x => x.RecipientId == actor && (x.ExpiresAt == null || x.ExpiresAt > now)).Select(x => x.FileId).ToArrayAsync(ct);
            var sharedRoots = await all.Where(x => roots.Contains(x.Id) && x.DeletedAt == null && x.OwnerId != actor && db.Profiles.Any(p => p.Id == x.OwnerId && !p.Disabled)).ToArrayAsync(ct);
            var owners = sharedRoots.Select(x => x.OwnerId).Distinct().ToArray();
            var entries = await all.Where(x => owners.Contains(x.OwnerId) && x.DeletedAt == null).ToArrayAsync(ct);
            var ids = sharedRoots.SelectMany(x => Descendants(entries, x.Id)).Distinct().ToArray();
            all = all.Where(x => ids.Contains(x.Id) && x.DeletedAt == null);
        }
        else all = all.Where(x => x.OwnerId == actor && (group == "trash" ? x.DeletedAt != null : x.DeletedAt == null));
        var owned = token == null ? await db.Files.AsNoTracking().Where(x => x.OwnerId == actor && x.PurgedAt == null).Select(x => new StoredFile { Id = x.Id, Name = x.Name, Size = x.Size, IsFolder = x.IsFolder, DeletedAt = x.DeletedAt, Ready = x.Ready }).ToArrayAsync(ct) : [];
        var treeQuery = all.Where(x => x.IsFolder);
        var grouped = group switch
        {
            "important" => all.Where(x => x.Important),
            "starred" => all.Where(x => x.Starred),
            _ => all
        };
        var scoped = parentId != null ? grouped.Where(x => x.ParentId == parentId) : grouped;
        var recent = await scoped.OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt).ThenByDescending(x => x.Id).Take(6).ToArrayAsync(ct);
        if (parentId == null && group == "my-files") scoped = scoped.Where(x => x.ParentId == null);
        if (parentId == null && group == "trash") scoped = scoped.Where(x => x.ParentId == null || !db.Files.Any(p => p.Id == x.ParentId && p.DeletedAt != null && p.PurgedAt == null));
        var fileCount = await scoped.CountAsync(x => !x.IsFolder, ct);
        if (!string.IsNullOrWhiteSpace(search)) scoped = scoped.Where(x => x.Name.Contains(search) || x.Description.Contains(search) || x.Tags.Contains(search));
        var total = await scoped.CountAsync(ct); var desc = direction == "desc";
        var ordered = sort switch
        {
            "name" => desc ? scoped.OrderByDescending(x => x.Name) : scoped.OrderBy(x => x.Name),
            "size" => desc ? scoped.OrderByDescending(x => x.Size) : scoped.OrderBy(x => x.Size),
            "createdAt" => desc ? scoped.OrderByDescending(x => x.CreatedAt) : scoped.OrderBy(x => x.CreatedAt),
            _ => desc ? scoped.OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt) : scoped.OrderBy(x => x.UpdatedAt ?? x.CreatedAt)
        };
        var rows = await ordered.ThenBy(x => x.Id).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToArrayAsync(ct);
        var childCounts = await all.Where(x => x.ParentId != null).GroupBy(x => x.ParentId!.Value).Select(x => new { Id = x.Key, Count = x.Count() }).ToDictionaryAsync(x => x.Id, x => x.Count, ct);
        var childFileCounts = await grouped.Where(x => x.ParentId != null && !x.IsFolder).GroupBy(x => x.ParentId!.Value).Select(x => new { Id = x.Key, Count = x.Count() }).ToDictionaryAsync(x => x.Id, x => x.Count, ct);
        async Task<FileItem[]> Items(StoredFile[] values)
        {
            var result = new List<FileItem>();
            foreach (var value in values) result.Add(Item(value) with { ItemCount = childCounts.GetValueOrDefault(value.Id), FileCount = childFileCounts.GetValueOrDefault(value.Id), Permission = token != null ? "viewer" : value.OwnerId == actor ? "owner" : await Permission(actor, value, ct) ?? "viewer" });
            return result.ToArray();
        }
        var usage = owned.Where(x => !x.IsFolder).Select(x => new { Category = x.DeletedAt != null ? "trash" : !x.Ready ? "pending" : Category(x.Name), x.Size })
            .GroupBy(x => x.Category).Select(x => new FileUsageSegment(x.Key, x.Sum(f => f.Size), x.Count())).ToArray();
        var ownerName = token == null ? await db.Profiles.Where(x => x.Id == actor).Select(x => x.DisplayName).SingleOrDefaultAsync(ct) ?? "" : "";
        var quota = token == null ? await Quota(actor, ct) : 0;
        var quotaOverride = token == null ? await db.Users.Where(x => x.Id == actor).Select(x => x.StorageQuotaBytes).SingleAsync(ct) : null;
        var settings = await Settings(ct);
        return Result<FilePage>.Success(new(new(await Items(rows), total, pageNumber, pageSize), usage.Sum(x => x.Bytes), quota, settings.MaxUploadBytes, folder is null ? null : Item(folder), quotaOverride, ownerName, await Items(recent), token == null ? await Items(await treeQuery.ToArrayAsync(ct)) : [], usage, fileCount, settings.DemoMode, settings.DemoExpiryMinutes, settings.SlowUploadMode));
    }
    public async Task<Result<Unit>> Metadata(Guid actor, Guid id, FileMetadataRequest request, CancellationToken ct)
    {
        if (!ValidName(request.Name) || request.Description is null || request.Tags is null || request.Description.Length > 4000 || request.Tags.Length > 1000) return Result.Fail("validation.failed", ErrorKind.Validation);
        var file = await Access(actor, id, true, ct); if (file is null) return Result.Fail("files.not_found", ErrorKind.NotFound);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(file.OwnerId, ct);
        file = await Access(actor, id, true, ct);
        if (file is null) return Result.Fail("files.not_found", ErrorKind.NotFound);
        await db.Files.Where(x => x.Id == id).ExecuteUpdateAsync(s => s.SetProperty(x => x.Name, request.Name.Trim()).SetProperty(x => x.Description, request.Description.Trim()).SetProperty(x => x.Tags, request.Tags.Trim()).SetProperty(x => x.Important, request.Important).SetProperty(x => x.Starred, request.Starred).SetProperty(x => x.UpdatedAt, time.GetUtcNow()), ct);
        db.Audit.Add(new() { ActorId = actor, SubjectId = id, Action = file.Name != request.Name.Trim() ? "file.renamed" : "file.metadata_updated", SubjectType = "file", SubjectNameSnapshot = request.Name.Trim(), ChangesJson = AuditCapture.Changes(new AuditChange("name", file.Name, request.Name.Trim())), At = time.GetUtcNow() }); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<Unit>> Move(Guid actor, Guid id, FileMoveRequest request, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(actor, ct);
        var entries = await db.Files.AsNoTracking().Where(x => x.OwnerId == actor && x.DeletedAt == null && x.PurgedAt == null).ToArrayAsync(ct);
        var file = entries.SingleOrDefault(x => x.Id == id && x.Ready);
        if (file is null || !await FolderExists(actor, request.ParentId, ct)) return Result.Fail("files.not_found", ErrorKind.NotFound);
        if (request.ParentId is { } parent && Descendants(entries, id).Contains(parent)) return Result.Fail("files.invalid_move", ErrorKind.Validation);
        var siblingNames = entries.Where(x => x.Id != id && x.ParentId == request.ParentId && x.Ready).Select(x => x.Name);
        var name = UniqueMoveName(file.Name, file.IsFolder, siblingNames);
        await db.Files.Where(x => x.Id == id).ExecuteUpdateAsync(s => s.SetProperty(x => x.ParentId, request.ParentId).SetProperty(x => x.Name, name).SetProperty(x => x.UpdatedAt, time.GetUtcNow()), ct);
        Audit(actor, id, "moved"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }

    private static string UniqueMoveName(string name, bool isFolder, IEnumerable<string> siblingNames)
    {
        var used = siblingNames.ToHashSet(StringComparer.OrdinalIgnoreCase);
        if (!used.Contains(name)) return name;
        var extension = isFolder ? "" : Path.GetExtension(name);
        var stem = extension.Length == name.Length ? name : name[..^extension.Length];
        for (var index = 1; ; index++)
        {
            var suffix = $" ({index})";
            var maximumStemLength = 180 - suffix.Length - extension.Length;
            var candidate = stem[..Math.Min(stem.Length, Math.Max(0, maximumStemLength))] + suffix + extension;
            if (!used.Contains(candidate)) return candidate;
        }
    }
    public async Task<Result<Unit>> Trash(Guid actor, Guid? id, bool restore, bool purge, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(actor, ct);
        var entries = await db.Files.AsNoTracking().Where(x => x.OwnerId == actor && x.PurgedAt == null && !x.PurgeRequested).ToArrayAsync(ct);
        var root = entries.SingleOrDefault(x => x.Id == id);
        if (id != null && (root is null || restore && root.DeletedAt == null || purge && root.DeletedAt == null)) return Result.Fail("files.not_found", ErrorKind.NotFound);
        if (id == null && !purge) return Result.Fail("validation.failed", ErrorKind.Validation);
        if (!restore && !purge && root?.IsFolder == true && await db.Files.AnyAsync(x => x.OwnerId == actor && x.ParentId == id && x.DeletedAt == null && x.PurgedAt == null, ct)) return Result.Fail("files.folder_not_empty", ErrorKind.Conflict);
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
            await db.Set<MyFileShare>().Where(x => ids.Contains(x.FileId)).ExecuteDeleteAsync(ct);
        }
        Audit(actor, id ?? actor, restore ? "restored" : purge ? "purge_requested" : "deleted");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<FileShareItem[]>> Shares(Guid actor, Guid id, CancellationToken ct)
    {
        if (!await db.Files.AnyAsync(x => x.Id == id && x.OwnerId == actor && x.DeletedAt == null && x.Ready, ct)) return Result<FileShareItem[]>.Fail("files.not_found", ErrorKind.NotFound);
        return Result<FileShareItem[]>.Success(await db.Set<MyFileShare>().Where(x => x.FileId == id).OrderByDescending(x => x.CreatedAt).Select(x => new FileShareItem(x.Id, db.Users.Where(u => u.Id == x.RecipientId).Select(u => u.Email).FirstOrDefault(), x.Permission, x.ExpiresAt, null)).ToArrayAsync(ct));
    }
    public async Task<Result<FileShareItem>> Share(Guid actor, Guid id, FileShareRequest request, CancellationToken ct)
    {
        if (request.Permission is not ("viewer" or "editor") || request.ExpiresAt <= time.GetUtcNow() || request.Email is { Length: > 256 } || string.IsNullOrWhiteSpace(request.Email) && request.Permission != "viewer") return Result<FileShareItem>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(actor, ct);
        if (!await db.Files.AnyAsync(x => x.Id == id && x.OwnerId == actor && x.Ready && x.DeletedAt == null, ct)) return Result<FileShareItem>.Fail("files.not_found", ErrorKind.NotFound);
        Guid? recipient = null; string? token = null;
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var email = request.Email.Trim().ToUpperInvariant();
            recipient = await db.Users.Where(x => x.NormalizedEmail == email && db.Profiles.Any(p => p.Id == x.Id && !p.Disabled)).Select(x => (Guid?)x.Id).SingleOrDefaultAsync(ct);
            if (recipient == null || recipient == actor) return Result<FileShareItem>.Fail("files.recipient_invalid", ErrorKind.Validation);
        }
        else token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var row = new MyFileShare { FileId = id, RecipientId = recipient, Permission = request.Permission, ExpiresAt = request.ExpiresAt?.ToUniversalTime(), CreatedAt = time.GetUtcNow(), TokenHash = token is null ? null : Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))) };
        db.Add(row); Audit(actor, id, "shared"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<FileShareItem>.Success(new(row.Id, request.Email, row.Permission, row.ExpiresAt, token));
    }
    public async Task<Result<Unit>> Revoke(Guid actor, Guid id, Guid shareId, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(actor, ct);
        if (!await db.Files.AnyAsync(x => x.Id == id && x.OwnerId == actor, ct)) return Result.Fail("files.not_found", ErrorKind.NotFound);
        await db.Set<MyFileShare>().Where(x => x.FileId == id && x.Id == shareId).ExecuteDeleteAsync(ct);
        Audit(actor, id, "share_revoked"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<FileItem>> PublicItem(Guid id, string token, CancellationToken ct)
    {
        var file = await Access(Guid.Empty, id, false, ct, token);
        if (file is null) return Result<FileItem>.Fail("files.not_found", ErrorKind.NotFound);
        var settings = await Settings(ct);
        return Result<FileItem>.Success(Item(file) with { Permission = "viewer", DemoMode = settings.DemoMode, DemoExpiryMinutes = settings.DemoExpiryMinutes });
    }
    public async Task<Result<FileDownload>> PublicDownload(Guid id, string token, CancellationToken ct)
    {
        var file = await Access(Guid.Empty, id, false, ct, token);
        return file is null || file.IsFolder ? Result<FileDownload>.Fail("files.not_found", ErrorKind.NotFound) : Result<FileDownload>.Success(new(await storage.Read(file.Id.ToString("N"), ct), file.Name));
    }
}
