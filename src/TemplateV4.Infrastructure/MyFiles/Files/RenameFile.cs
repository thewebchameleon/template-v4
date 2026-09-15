namespace TemplateV4.Infrastructure.Storage;

public sealed partial class MyFilesService
{
    public async Task<Result<Unit>> Rename(Guid actor, Guid id, FileNameRequest request, CancellationToken ct)
    {
        var file = await Access(actor, id, true, ct);
        if (file is null) return Result.Fail("files.not_found", ErrorKind.NotFound);
        return await Metadata(actor, id, new(request.Name, file.Description, file.Tags, file.Important, file.Starred), ct);
    }
}
