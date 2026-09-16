namespace TemplateV4.Infrastructure.Storage;

public sealed partial class MyFilesService
{
    public async Task<Result<FileDownload>> Download(Guid actor, Guid id, CancellationToken ct)
    {
        var file = await Access(actor, id, false, ct);
        if (file is null || file.IsFolder) return Result<FileDownload>.Fail("files.not_found", ErrorKind.NotFound);
        return Result<FileDownload>.Success(new(await storage.Read(file.ObjectKey, ct), file.Name));
    }
}
