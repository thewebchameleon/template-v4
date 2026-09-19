using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class FileStorageService
{
    public async Task<Result<FilePage>> List(Guid actor, int pageNumber, int pageSize, string? search, string sort, string direction, CancellationToken ct, Guid? parentId = null, string group = "file-storage", string? token = null)
    {
        if (pageNumber is < 1 or > 10000 || pageSize is < 1 or > 100 || search is { Length: > 120 } || sort is not ("name" or "size" or "createdAt" or "updatedAt") || direction is not ("asc" or "desc") || group is not ("file-storage" or "important" or "shared" or "recent" or "starred" or "trash")) return Result<FilePage>.Fail("validation.failed", ErrorKind.Validation);
        if (token is null && !await Active(actor, ct)) return Result<FilePage>.Fail("files.not_found", ErrorKind.NotFound);
        StoredFile? folder = null;
        if (parentId != null)
        {
            folder = group == "trash" && token == null ? await db.Files.AsNoTracking().SingleOrDefaultAsync(x => x.Id == parentId && x.DeletedAt != null && x.PurgedAt == null && !x.PurgeRequested, ct) : await Access(actor, parentId.Value, false, ct, token);
            if (folder is null || !folder.IsFolder) return Result<FilePage>.Fail("files.not_found", ErrorKind.NotFound);
        }
        var now = time.GetUtcNow();
        IQueryable<StoredFile> all = db.Files.AsNoTracking().Where(x => x.Ready && x.PurgedAt == null && !x.PurgeRequested);
        if (token != null)
        {
            if (folder is null) return Result<FilePage>.Fail("files.not_found", ErrorKind.NotFound);
            all = all.Where(x => x.DeletedAt == null);
        }
        else if (group == "shared")
        {
            var roots = await db.Set<FileStorageShare>().Where(x => x.RecipientId == actor && (x.ExpiresAt == null || x.ExpiresAt > now)).Select(x => x.FileId).ToArrayAsync(ct);
            var sharedRoots = await all.Where(x => roots.Contains(x.Id) && x.DeletedAt == null).ToArrayAsync(ct);
            var entries = await all.Where(x => x.DeletedAt == null).ToArrayAsync(ct);
            var ids = sharedRoots.SelectMany(x => Descendants(entries, x.Id)).Distinct().ToArray();
            all = all.Where(x => ids.Contains(x.Id) && x.DeletedAt == null);
        }
        else all = all.Where(x => (group == "trash" ? x.DeletedAt != null : x.DeletedAt == null));
        var owned = token == null ? await db.Files.AsNoTracking().Where(x => x.PurgedAt == null).Select(x => new StoredFile { Id = x.Id, Name = x.Name, Size = x.Size, IsFolder = x.IsFolder, DeletedAt = x.DeletedAt, Ready = x.Ready }).ToArrayAsync(ct) : [];
        var treeQuery = all.Where(x => x.IsFolder);
        var grouped = group switch
        {
            "important" => all.Where(x => x.Important),
            "starred" => all.Where(x => x.Starred),
            _ => all
        };
        var scoped = parentId != null ? grouped.Where(x => x.ParentId == parentId) : grouped;
        var recent = await scoped.OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt).ThenByDescending(x => x.Id).Take(6).ToArrayAsync(ct);
        if (parentId == null && group == "file-storage") scoped = scoped.Where(x => x.ParentId == null);
        if (parentId == null && group == "trash") scoped = scoped.Where(x => x.ParentId == null || !db.Files.Any(p => p.Id == x.ParentId && p.DeletedAt != null && p.PurgedAt == null));
        var fileCount = await scoped.CountAsync(x => !x.IsFolder, ct);
        if (!string.IsNullOrWhiteSpace(search)) scoped = scoped.Where(x => x.Name.Contains(search));
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
        var permission = token is null && await CanWrite(actor, ct) ? "owner" : "viewer";
        FileItem[] Items(StoredFile[] values)
        {
            var result = new List<FileItem>();
            foreach (var value in values) result.Add(Item(value) with { ItemCount = childCounts.GetValueOrDefault(value.Id), FileCount = childFileCounts.GetValueOrDefault(value.Id), Permission = permission });
            return result.ToArray();
        }
        var usage = owned.Where(x => !x.IsFolder).Select(x => new { Category = x.DeletedAt != null ? "trash" : !x.Ready ? "pending" : Category(x.Name), x.Size })
            .GroupBy(x => x.Category).Select(x => new FileUsageSegment(x.Key, x.Sum(f => f.Size), x.Count())).ToList();
        var usedBytes = token == null ? await storageUsage.Read(ct) : 0;
        var externalBytes = usedBytes - usage.Sum(x => x.Bytes);
        if (externalBytes > 0)
        {
            var other = usage.FindIndex(x => x.Category == "other");
            if (other < 0) usage.Add(new("other", externalBytes, 0));
            else usage[other] = usage[other] with { Bytes = usage[other].Bytes + externalBytes };
        }
        var ownerName = token == null ? await db.Set<CustomerRow>().Select(x => x.Name).SingleAsync(ct) : "";
        var quota = token == null ? await Quota(actor, ct) : 0;
        long? quotaOverride = null;
        var settings = await Settings(ct);
        return Result<FilePage>.Success(new(new(Items(rows), total, pageNumber, pageSize), usedBytes, quota, settings.MaxUploadBytes, folder is null ? null : Items([folder])[0], quotaOverride, ownerName, Items(recent), token == null ? Items(await treeQuery.ToArrayAsync(ct)) : [], usage.ToArray(), fileCount, settings.DemoMode, settings.DemoExpiryMinutes, settings.SlowUploadMode));
    }
}
