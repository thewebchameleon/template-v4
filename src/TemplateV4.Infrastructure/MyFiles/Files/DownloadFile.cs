using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class MyFilesService
{
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
}
