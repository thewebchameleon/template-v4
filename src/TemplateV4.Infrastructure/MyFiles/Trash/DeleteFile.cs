namespace TemplateV4.Infrastructure.Storage;

public sealed partial class MyFilesService
{
    public Task<Result<Unit>> Delete(Guid actor, Guid id, CancellationToken ct) => Trash(actor, id, false, false, ct);
}
