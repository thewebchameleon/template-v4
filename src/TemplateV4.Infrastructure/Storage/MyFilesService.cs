using System.Globalization;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed record FileItem(Guid Id, string Name, string ContentType, long Size, DateTimeOffset CreatedAt, bool IsFolder, Guid? ParentId, DateTimeOffset? UpdatedAt = null, string Description = "", string Tags = "", bool Important = false, bool Starred = false, string Permission = "owner", string Category = "other", int ItemCount = 0, int FileCount = 0, bool DemoMode = false, int DemoExpiryMinutes = 60);
public sealed record FilePage(Page<FileItem> Page, long UsedBytes, long QuotaBytes, long MaxUploadBytes, FileItem? Folder, long? QuotaOverrideBytes, string OwnerName, FileItem[] Recent, FileItem[] Folders, FileUsageSegment[] Usage, int FileCount = 0, bool DemoMode = false, int DemoExpiryMinutes = 60, bool SlowUploadMode = false);
public sealed record FileDownload(Stream Content, string Name);
public sealed record FileNameRequest(string Name);
public sealed record CreateFolderRequest(string Name, Guid? ParentId = null);
public sealed record FileQuotaRequest(long? QuotaBytes);
public sealed record StorageSettingsRequest(long DefaultQuotaBytes, long MaxUploadBytes, Guid Version, int DemoExpiryMinutes = 60);
public sealed partial class MyFilesService(FrameworkDb db, IFileStorage storage, TimeProvider time, TemplateV4.Application.Billing.IStorageEntitlements entitlements)
{
    public const long DefaultMaxUploadBytes = 20L * 1024 * 1024;
    public const long MinimumUploadBytes = 5L * 1024 * 1024;
    public const long MaximumUploadBytes = 1000L * 1024 * 1024;
    public const long MinimumDefaultQuotaBytes = 50L * 1024 * 1024;
    public const long MaximumDefaultQuotaBytes = 20000L * 1024 * 1024;
    public const long MaximumQuotaBytes = 100L * 1024 * 1024 * 1024;
    private static bool ValidName(string? name) => !string.IsNullOrWhiteSpace(name) && name.Length <= 180 && name.Trim() is not ("." or "..") && !name.Any(c => char.IsControl(c) || c is '/' or '\\');
    private static FileItem Item(StoredFile file) => new(file.Id, file.Name, file.ContentType, file.Size, file.CreatedAt, file.IsFolder, file.ParentId, file.UpdatedAt ?? file.CreatedAt, file.Description, file.Tags, file.Important, file.Starred, "owner", Category(file.Name));
    private Task Lock(Guid owner, CancellationToken ct) => db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({owner.ToString()}, 0))", ct);
    private Task<bool> FolderExists(Guid owner, Guid? parent, CancellationToken ct) => parent is null ? Task.FromResult(true) : db.Files.AnyAsync(x => x.Id == parent && x.OwnerId == owner && x.IsFolder && x.Ready && x.DeletedAt == null, ct);
    private Task<bool> Active(Guid owner, CancellationToken ct) => db.Profiles.AnyAsync(x => x.Id == owner && !x.Disabled, ct);
    private async Task<long> Quota(Guid owner, CancellationToken ct) => await entitlements.Quota(owner, ct) ?? await db.Users.Where(x => x.Id == owner).Select(x => x.StorageQuotaBytes).SingleAsync(ct) ?? (await Settings(ct)).DefaultQuotaBytes;
    public Task<FileStorageSettings> Settings(CancellationToken ct) => db.FileStorageSettings.AsNoTracking().SingleAsync(ct);
    public async Task<Result<Unit>> SaveSettings(Guid actor, StorageSettingsRequest request, CancellationToken ct)
    {
        if (!ValidDefaultQuotaBytes(request.DefaultQuotaBytes) || !ValidMaxUploadBytes(request.MaxUploadBytes) || request.DemoExpiryMinutes is < 1 or > 525600) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var previous = await db.FileStorageSettings.FromSqlRaw("SELECT * FROM files.file_storage_settings WHERE \"Id\" = 1 FOR UPDATE").AsNoTracking().SingleAsync(ct);
        var restartedAt = previous.DemoMode && previous.DemoExpiryMinutes != request.DemoExpiryMinutes ? time.GetUtcNow() : previous.DemoStartedAt;
        var changed = await db.FileStorageSettings.Where(x => x.Id == 1 && x.Version == request.Version).ExecuteUpdateAsync(x => x.SetProperty(s => s.DefaultQuotaBytes, request.DefaultQuotaBytes).SetProperty(s => s.MaxUploadBytes, request.MaxUploadBytes).SetProperty(s => s.DemoExpiryMinutes, request.DemoExpiryMinutes).SetProperty(s => s.DemoStartedAt, restartedAt).SetProperty(s => s.Version, Guid.NewGuid()), ct);
        if (changed == 0) return Result.Fail("files.settings_conflict", ErrorKind.Conflict);
        if (previous.DemoExpiryMinutes != request.DemoExpiryMinutes)
            db.Audit.Add(new() { ActorId = actor, Action = "file.demo_expiry_changed", SubjectType = "configuration", SubjectNameSnapshot = "storage", ChangesJson = AuditCapture.Changes(new AuditChange("demoExpiryMinutes", previous.DemoExpiryMinutes.ToString(CultureInfo.InvariantCulture), request.DemoExpiryMinutes.ToString(CultureInfo.InvariantCulture))), At = time.GetUtcNow() });
        if (previous.DefaultQuotaBytes != request.DefaultQuotaBytes)
            db.Audit.Add(new() { ActorId = actor, Action = "file.quota_default_changed", SubjectType = "configuration", SubjectNameSnapshot = "storage", ChangesJson = AuditCapture.Changes(new AuditChange("defaultQuotaBytes", previous.DefaultQuotaBytes.ToString(CultureInfo.InvariantCulture), request.DefaultQuotaBytes.ToString(CultureInfo.InvariantCulture))), At = time.GetUtcNow() });
        if (previous.MaxUploadBytes != request.MaxUploadBytes)
            db.Audit.Add(new() { ActorId = actor, Action = "file.max_upload_changed", SubjectType = "configuration", SubjectNameSnapshot = "storage", ChangesJson = AuditCapture.Changes(new AuditChange("maxUploadBytes", previous.MaxUploadBytes.ToString(CultureInfo.InvariantCulture), request.MaxUploadBytes.ToString(CultureInfo.InvariantCulture))), At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<Unit>> SetQuota(Guid actor, Guid owner, FileQuotaRequest request, CancellationToken ct)
    {
        if (request.QuotaBytes is < 0 or > MaximumQuotaBytes) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await Lock(owner, ct);
        if (!await db.Profiles.AnyAsync(x => x.Id == owner, ct)) return Result.Fail("files.not_found", ErrorKind.NotFound);
        var previous = await db.Users.Where(x => x.Id == owner).Select(x => x.StorageQuotaBytes).SingleAsync(ct);
        await db.Users.Where(x => x.Id == owner).ExecuteUpdateAsync(x => x.SetProperty(u => u.StorageQuotaBytes, request.QuotaBytes), ct);
        db.Audit.Add(new() { ActorId = actor, SubjectId = owner, Action = "file.quota_changed", SubjectType = "user", ChangesJson = AuditCapture.Changes(new AuditChange("quotaBytes", previous?.ToString(CultureInfo.InvariantCulture), request.QuotaBytes?.ToString(CultureInfo.InvariantCulture))), At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
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
        var maxUploadBytes = (await Settings(ct)).MaxUploadBytes;
        await using var content = TemporaryUpload();
        var buffer = new byte[81920];
        int read;
        while ((read = await input.ReadAsync(buffer, ct)) > 0)
        {
            if (maxUploadBytes > 0 && content.Length + read > maxUploadBytes) return Result<FileItem>.Fail("files.too_large", ErrorKind.Validation);
            await content.WriteAsync(buffer.AsMemory(0, read), ct);
        }
        var file = new StoredFile { OwnerId = actor, ParentId = parentId, Name = name.Trim(), Size = content.Length, CreatedAt = time.GetUtcNow() };
        await using (var reserve = await db.Database.BeginTransactionAsync(ct))
        {
            await Lock(actor, ct);
            if (!await Active(actor, ct)) return Result<FileItem>.Fail("authorization.denied", ErrorKind.Forbidden);
            if (!await FolderExists(actor, parentId, ct)) return Result<FileItem>.Fail("files.not_found", ErrorKind.NotFound);
            var used = await Used(actor, ct);
            var quota = await Quota(actor, ct);
            if (quota == 0 || quota > 0 && used + file.Size > quota) return Result<FileItem>.Fail("files.quota", ErrorKind.Conflict);
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
        db.Audit.Add(new() { ActorId = actor, SubjectId = file.Id, Action = "file.uploaded", SubjectType = "file", SubjectNameSnapshot = file.Name, MetadataJson = JsonSerializer.Serialize(new Dictionary<string, string> { ["sizeBytes"] = file.Size.ToString(CultureInfo.InvariantCulture), ["contentType"] = file.ContentType }), RelatedEntitiesJson = JsonSerializer.Serialize(new[] { new AuditRelatedEntity("user", actor, null) }), At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await finish.CommitAsync(ct);
        return Result<FileItem>.Success(Item(file));
    }
    private static FileStream TemporaryUpload() => new(
        Path.Combine(Path.GetTempPath(), Path.GetRandomFileName()),
        FileMode.CreateNew,
        FileAccess.ReadWrite,
        FileShare.None,
        81920,
        FileOptions.Asynchronous | FileOptions.DeleteOnClose | FileOptions.SequentialScan);
    private static bool ValidMaxUploadBytes(long bytes)
    {
        const long mb = 1024 * 1024;
        return bytes == 0
            || bytes is >= 5 * mb and <= 100 * mb && bytes % (5 * mb) == 0
            || bytes is >= 110 * mb and <= 200 * mb && bytes % (10 * mb) == 0
            || bytes is >= 250 * mb and <= 500 * mb && bytes % (50 * mb) == 0
            || bytes is >= 600 * mb and <= 1000 * mb && bytes % (100 * mb) == 0;
    }
    private static bool ValidDefaultQuotaBytes(long bytes)
    {
        const long mb = 1024 * 1024;
        return bytes == -1
            || bytes is >= 50 * mb and <= 100 * mb && bytes % (5 * mb) == 0
            || bytes is >= 110 * mb and <= 200 * mb && bytes % (10 * mb) == 0
            || bytes is >= 250 * mb and <= 500 * mb && bytes % (50 * mb) == 0
            || bytes is >= 600 * mb and <= 1000 * mb && bytes % (100 * mb) == 0
            || bytes is >= 1100 * mb and <= 5000 * mb && bytes % (100 * mb) == 0
            || bytes is >= 6000 * mb and <= 20000 * mb && bytes % (1000 * mb) == 0;
    }
    public async Task<Result<FileDownload>> Download(Guid actor, Guid id, CancellationToken ct, Guid? administrator = null)
    {
        var file = administrator is null ? await Access(actor, id, false, ct) : await db.Files.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.OwnerId == actor && x.Ready && !x.IsFolder && x.DeletedAt == null && x.PurgedAt == null && !x.PurgeRequested, ct);
        if (file?.IsFolder == true || administrator != null && file?.OwnerId != actor) file = null;
        if (file is null) return Result<FileDownload>.Fail("files.not_found", ErrorKind.NotFound);
        if (administrator is not null)
        {
            db.Audit.Add(new() { ActorId = administrator, SubjectId = id, Action = "file.admin_downloaded", At = time.GetUtcNow() });
            await db.SaveChangesAsync(ct);
        }
        return Result<FileDownload>.Success(new(await storage.Read(file.Id.ToString("N"), ct), file.Name));
    }
    public async Task<Result<Unit>> Rename(Guid actor, Guid id, FileNameRequest request, CancellationToken ct)
    {
        var file = await Access(actor, id, true, ct);
        if (file is null) return Result.Fail("files.not_found", ErrorKind.NotFound);
        return await Metadata(actor, id, new(request.Name, file.Description, file.Tags, file.Important, file.Starred), ct);
    }
    public Task<Result<Unit>> Delete(Guid actor, Guid id, CancellationToken ct) => Trash(actor, id, false, false, ct);
}
