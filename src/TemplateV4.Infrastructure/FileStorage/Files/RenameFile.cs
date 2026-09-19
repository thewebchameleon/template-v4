using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class FileStorageService
{
    public async Task<Result<Unit>> Rename(Guid actor, Guid id, FileNameRequest request, CancellationToken ct)
    {
        if (!ValidName(request.Name)) return Result.Fail("validation.failed", ErrorKind.Validation);
        var file = await Access(actor, id, true, ct);
        if (file is null) return Result.Fail("files.not_found", ErrorKind.NotFound);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(file.OwnerId, ct);
        file = await Access(actor, id, true, ct);
        if (file is null) return Result.Fail("files.not_found", ErrorKind.NotFound);
        var name = request.Name.Trim();
        if (file.IsFolder && await FolderNameExists(file.ParentId, name, file.Id, ct)) return Result.Fail("files.folder_name_exists", ErrorKind.Conflict);
        await db.Files.Where(x => x.Id == id).ExecuteUpdateAsync(s => s.SetProperty(x => x.Name, name).SetProperty(x => x.UpdatedAt, time.GetUtcNow()), ct);
        db.Audit.Add(new() { ActorId = actor, SubjectId = id, Action = "file.renamed", SubjectType = "file", SubjectNameSnapshot = name, ChangesJson = AuditCapture.Changes(new AuditChange("name", file.Name, name)), At = time.GetUtcNow() }); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
