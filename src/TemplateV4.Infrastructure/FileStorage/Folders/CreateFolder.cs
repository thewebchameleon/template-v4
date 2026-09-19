using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class FileStorageService
{
    public async Task<Result<FileItem>> CreateFolder(Guid actor, CreateFolderRequest request, CancellationToken ct)
    {
        if (!ValidName(request.Name)) return Result<FileItem>.Fail("files.invalid_name", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await Lock(actor, ct);
        if (!await CanWrite(actor, ct)) return Result<FileItem>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (!await FolderExists(actor, request.ParentId, ct)) return Result<FileItem>.Fail("files.not_found", ErrorKind.NotFound);
        if (await FolderNameExists(request.ParentId, request.Name, null, ct)) return Result<FileItem>.Fail("files.folder_name_exists", ErrorKind.Conflict);
        var folder = new StoredFile { OwnerId = actor, ParentId = request.ParentId, Name = request.Name.Trim(), IsFolder = true, Ready = true, CreatedAt = time.GetUtcNow() };
        db.Files.Add(folder);
        db.Audit.Add(new() { ActorId = actor, SubjectId = folder.Id, Action = "file.folder_created", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<FileItem>.Success(Item(folder));
    }
}
