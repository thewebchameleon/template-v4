using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class MyFilesService
{
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
}
