using System.Globalization;
using System.Text.Json;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class FileStorageService
{
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
        await using (var reserve = await db.Session.BeginTransactionAsync(ct))
        {
            await Lock(actor, ct);
            if (!await CanWrite(actor, ct)) return Result<FileItem>.Fail("authorization.denied", ErrorKind.Forbidden);
            if (!await FolderExists(actor, parentId, ct)) return Result<FileItem>.Fail("files.not_found", ErrorKind.NotFound);
            if (!await storageQuota.Fits(0, file.Size, ct)) return Result<FileItem>.Fail("files.quota", ErrorKind.Conflict);
            db.Files.Add(file); await db.SaveChangesAsync(ct); await reserve.CommitAsync(ct);
        }
        // Durable reservations allow maintenance to reconcile uploads interrupted between storage and DB.
        content.Position = 0;
        await storage.Write(file.Id.ToString("N"), content, ct);
        await using var finish = await db.Session.BeginTransactionAsync(ct);
        await Lock(actor, ct);
        await db.Entry(file).ReloadAsync(ct);
        if (file.DeletedAt != null || !await CanWrite(actor, ct)) return Result<FileItem>.Fail("authorization.denied", ErrorKind.Forbidden);
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
}
