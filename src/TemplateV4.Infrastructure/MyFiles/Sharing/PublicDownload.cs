namespace TemplateV4.Infrastructure.Storage;

public sealed partial class MyFilesService
{
    public async Task<Result<FileItem>> PublicItem(Guid id, string token, CancellationToken ct)
    {
        var file = await Access(Guid.Empty, id, false, ct, token);
        if (file is null) return Result<FileItem>.Fail("files.not_found", ErrorKind.NotFound);
        var settings = await Settings(ct);
        return Result<FileItem>.Success(Item(file) with { Permission = "viewer", DemoMode = settings.DemoMode, DemoExpiryMinutes = settings.DemoExpiryMinutes });
    }
    public async Task<Result<FileDownload>> PublicDownload(Guid id, string token, CancellationToken ct)
    {
        var file = await Access(Guid.Empty, id, false, ct, token);
        return file is null || file.IsFolder ? Result<FileDownload>.Fail("files.not_found", ErrorKind.NotFound) : Result<FileDownload>.Success(new(await storage.Read(file.Id.ToString("N"), ct), file.Name));
    }
}
