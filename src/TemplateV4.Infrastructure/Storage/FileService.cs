using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed record FileItem(Guid Id, string Name, string ContentType, long Size, DateTimeOffset CreatedAt, bool IsFolder, Guid? ParentId);
public sealed record FilePage(Page<FileItem> Page, long UsedBytes, long QuotaBytes, long MaxUploadBytes, FileItem? Folder, long? QuotaOverrideBytes, string OwnerName);
public sealed record FileDownload(Stream Content, string Name);
public sealed record FileNameRequest(string Name);
public sealed record CreateFolderRequest(string Name, Guid? ParentId = null);
public sealed record FileQuotaRequest(long? QuotaBytes);
public sealed record StorageSettingsRequest(long DefaultQuotaBytes, Guid Version);
public sealed class FileService(FrameworkDb db, IFileStorage storage, TimeProvider time)
{
    public const long MaxUploadBytes = 20 * 1024 * 1024;
    public const long MaximumQuotaBytes = 100L * 1024 * 1024 * 1024;
    private static bool ValidName(string? name) => !string.IsNullOrWhiteSpace(name) && name.Length <= 180 && name.Trim() is not ("." or "..") && !name.Any(c => char.IsControl(c) || c is '/' or '\\');
    private static FileItem Item(StoredFile file) => new(file.Id, file.Name, file.ContentType, file.Size, file.CreatedAt, file.IsFolder, file.ParentId);
    private Task Lock(Guid owner, CancellationToken ct) => db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({owner.ToString()}, 0))", ct);
    private Task<bool> FolderExists(Guid owner, Guid? parent, CancellationToken ct) => parent is null ? Task.FromResult(true) : db.Files.AnyAsync(x => x.Id == parent && x.OwnerId == owner && x.IsFolder && x.Ready && x.DeletedAt == null, ct);
    private Task<bool> Active(Guid owner, CancellationToken ct) => db.Profiles.AnyAsync(x => x.Id == owner && !x.Disabled, ct);
    private async Task<long> Quota(Guid owner, CancellationToken ct) => await db.Users.Where(x => x.Id == owner).Select(x => x.StorageQuotaBytes).SingleAsync(ct) ?? (await Settings(ct)).DefaultQuotaBytes;
    public Task<FileStorageSettings> Settings(CancellationToken ct) => db.FileStorageSettings.AsNoTracking().SingleAsync(ct);
    public async Task<Result<Unit>> SaveSettings(Guid actor, StorageSettingsRequest request, CancellationToken ct)
    {
        if (request.DefaultQuotaBytes is < 0 or > MaximumQuotaBytes) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var changed = await db.FileStorageSettings.Where(x => x.Id == 1 && x.Version == request.Version).ExecuteUpdateAsync(x => x.SetProperty(s => s.DefaultQuotaBytes, request.DefaultQuotaBytes).SetProperty(s => s.Version, Guid.NewGuid()), ct);
        if (changed == 0) return Result.Fail("files.settings_conflict", ErrorKind.Conflict);
        db.Audit.Add(new() { ActorId = actor, Action = "file.quota_default_changed", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<Unit>> SetQuota(Guid actor, Guid owner, FileQuotaRequest request, CancellationToken ct)
    {
        if (request.QuotaBytes is < 0 or > MaximumQuotaBytes) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await Lock(owner, ct);
        if (!await db.Profiles.AnyAsync(x => x.Id == owner, ct)) return Result.Fail("files.not_found", ErrorKind.NotFound);
        await db.Users.Where(x => x.Id == owner).ExecuteUpdateAsync(x => x.SetProperty(u => u.StorageQuotaBytes, request.QuotaBytes), ct);
        db.Audit.Add(new() { ActorId = actor, SubjectId = owner, Action = "file.quota_changed", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<FilePage>> List(Guid actor, int pageNumber, int pageSize, string? search, string sort, string direction, CancellationToken ct, Guid? parentId = null)
    {
        if (pageNumber is < 1 or > 10000 || pageSize is < 1 or > 100 || search is { Length: > 120 } || sort is not ("name" or "size" or "createdAt") || direction is not ("asc" or "desc")) return Result<FilePage>.Fail("validation.failed", ErrorKind.Validation);
        var ownerName = await db.Profiles.Where(x => x.Id == actor).Select(x => x.DisplayName).SingleOrDefaultAsync(ct);
        if (ownerName is null || !await FolderExists(actor, parentId, ct)) return Result<FilePage>.Fail("files.not_found", ErrorKind.NotFound);
        var folder = parentId is null ? null : await db.Files.AsNoTracking().SingleAsync(x => x.Id == parentId, ct);
        var all = db.Files.AsNoTracking().Where(x => x.OwnerId == actor && x.ParentId == parentId && x.Ready && x.DeletedAt == null);
        var used = await db.Files.Where(x => x.OwnerId == actor && x.PurgedAt == null).SumAsync(x => x.Size, ct);
        if (!string.IsNullOrWhiteSpace(search)) all = all.Where(x => x.Name.Contains(search));
        var total = await all.CountAsync(ct);
        var descending = direction == "desc";
        var ordered = sort switch
        {
            "name" when descending => all.OrderByDescending(x => x.Name).ThenByDescending(x => x.Id),
            "name" => all.OrderBy(x => x.Name).ThenBy(x => x.Id),
            "size" when descending => all.OrderByDescending(x => x.Size).ThenByDescending(x => x.Id),
            "size" => all.OrderBy(x => x.Size).ThenBy(x => x.Id),
            _ when descending => all.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id),
            _ => all.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id)
        };
        var items = await ordered.Skip((pageNumber - 1) * pageSize).Take(pageSize).Select(x => new FileItem(x.Id, x.Name, x.ContentType, x.Size, x.CreatedAt, x.IsFolder, x.ParentId)).ToArrayAsync(ct);
        var quotaOverride = await db.Users.Where(x => x.Id == actor).Select(x => x.StorageQuotaBytes).SingleAsync(ct);
        return Result<FilePage>.Success(new(new(items, total, pageNumber, pageSize), used, await Quota(actor, ct), MaxUploadBytes, folder is null ? null : Item(folder), quotaOverride, ownerName));
    }
    public async Task<Result<FileItem>> CreateFolder(Guid actor, CreateFolderRequest request, CancellationToken ct)
    {
        if (!ValidName(request.Name)) return Result<FileItem>.Fail("files.invalid_name", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await Lock(actor, ct);
        if (!await Active(actor, ct)) return Result<FileItem>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (!await FolderExists(actor, request.ParentId, ct)) return Result<FileItem>.Fail("files.not_found", ErrorKind.NotFound);
        var folder = new StoredFile { OwnerId = actor, ParentId = request.ParentId, Name = request.Name.Trim(), IsFolder = true, Ready = true, CreatedAt = time.GetUtcNow() };
        db.Files.Add(folder);
        db.Audit.Add(new() { ActorId = actor, SubjectId = folder.Id, Action = "file.folder_created", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<FileItem>.Success(Item(folder));
    }
    public async Task<Result<FileItem>> Upload(Guid actor, string name, Stream input, CancellationToken ct, Guid? parentId = null)
    {
        if (!ValidName(name)) return Result<FileItem>.Fail("files.invalid_name", ErrorKind.Validation);
        using var content = new MemoryStream();
        var buffer = new byte[81920];
        int read;
        while ((read = await input.ReadAsync(buffer, ct)) > 0)
        {
            if (content.Length + read > MaxUploadBytes) return Result<FileItem>.Fail("files.too_large", ErrorKind.Validation);
            await content.WriteAsync(buffer.AsMemory(0, read), ct);
        }
        var file = new StoredFile { OwnerId = actor, ParentId = parentId, Name = name.Trim(), Size = content.Length, CreatedAt = time.GetUtcNow() };
        await using (var reserve = await db.Database.BeginTransactionAsync(ct))
        {
            await Lock(actor, ct);
            if (!await Active(actor, ct)) return Result<FileItem>.Fail("authorization.denied", ErrorKind.Forbidden);
            if (!await FolderExists(actor, parentId, ct)) return Result<FileItem>.Fail("files.not_found", ErrorKind.NotFound);
            var used = await db.Files.Where(x => x.OwnerId == actor && x.PurgedAt == null).SumAsync(x => x.Size, ct);
            var quota = await Quota(actor, ct);
            if (quota == 0 || used + file.Size > quota) return Result<FileItem>.Fail("files.quota", ErrorKind.Conflict);
            db.Files.Add(file); await db.SaveChangesAsync(ct); await reserve.CommitAsync(ct);
        }
        // Durable reservations allow maintenance to reconcile uploads interrupted between storage and DB.
        content.Position = 0;
        await storage.Write(file.Id.ToString("N"), content, ct);
        await using var finish = await db.Database.BeginTransactionAsync(ct);
        await Lock(actor, ct);
        await db.Entry(file).ReloadAsync(ct);
        if (file.DeletedAt != null || !await Active(actor, ct)) return Result<FileItem>.Fail("authorization.denied", ErrorKind.Forbidden);
        file.Ready = true;
        db.Audit.Add(new() { ActorId = actor, SubjectId = file.Id, Action = "file.uploaded", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await finish.CommitAsync(ct);
        return Result<FileItem>.Success(Item(file));
    }
    public async Task<Result<FileDownload>> Download(Guid actor, Guid id, CancellationToken ct, Guid? administrator = null)
    {
        var file = await db.Files.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.OwnerId == actor && !x.IsFolder && x.Ready && x.DeletedAt == null, ct);
        if (file is null) return Result<FileDownload>.Fail("files.not_found", ErrorKind.NotFound);
        if (administrator is not null)
        {
            db.Audit.Add(new() { ActorId = administrator, SubjectId = id, Action = "file.admin_downloaded", At = time.GetUtcNow() });
            await db.SaveChangesAsync(ct);
        }
        return Result<FileDownload>.Success(new(await storage.Read(id.ToString("N"), ct), file.Name));
    }
    public async Task<Result<Unit>> Rename(Guid actor, Guid id, FileNameRequest request, CancellationToken ct)
    {
        if (!ValidName(request.Name)) return Result.Fail("files.invalid_name", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await Lock(actor, ct);
        var changed = await db.Files.Where(x => x.Id == id && x.OwnerId == actor && x.Ready && x.DeletedAt == null).ExecuteUpdateAsync(x => x.SetProperty(f => f.Name, request.Name.Trim()), ct);
        if (changed == 0) return Result.Fail("files.not_found", ErrorKind.NotFound);
        db.Audit.Add(new() { ActorId = actor, SubjectId = id, Action = "file.renamed", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<Unit>> Delete(Guid actor, Guid id, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await Lock(actor, ct);
        // Only empty folders can be deleted; reservations also keep their parent alive.
        if (await db.Files.AnyAsync(x => x.OwnerId == actor && x.ParentId == id && x.DeletedAt == null, ct)) return Result.Fail("files.folder_not_empty", ErrorKind.Conflict);
        var changed = await db.Files.Where(x => x.Id == id && x.OwnerId == actor && x.DeletedAt == null).ExecuteUpdateAsync(x => x.SetProperty(f => f.DeletedAt, time.GetUtcNow()), ct);
        if (changed == 0) return Result.Fail("files.not_found", ErrorKind.NotFound);
        db.Audit.Add(new() { ActorId = actor, SubjectId = id, Action = "file.deleted", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
