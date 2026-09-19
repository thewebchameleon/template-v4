using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class FileStorageService
{
    public async Task<Result<Unit>> Metadata(Guid actor, Guid id, FileMetadataRequest request, CancellationToken ct)
    {
        var file = await Access(actor, id, true, ct); if (file is null) return Result.Fail("files.not_found", ErrorKind.NotFound);
        await db.Files.Where(x => x.Id == id).ExecuteUpdateAsync(s => s.SetProperty(x => x.Important, request.Important).SetProperty(x => x.Starred, request.Starred).SetProperty(x => x.UpdatedAt, time.GetUtcNow()), ct);
        db.Audit.Add(new() { ActorId = actor, SubjectId = id, Action = "file.metadata_updated", SubjectType = "file", SubjectNameSnapshot = file.Name, ChangesJson = AuditCapture.Changes(new AuditChange("important", file.Important.ToString(), request.Important.ToString()), new AuditChange("starred", file.Starred.ToString(), request.Starred.ToString())), At = time.GetUtcNow() }); await db.SaveChangesAsync(ct); return Result.Success();
    }
}
