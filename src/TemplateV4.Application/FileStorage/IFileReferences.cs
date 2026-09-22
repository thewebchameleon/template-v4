namespace TemplateV4.Application.FileStorage;

public interface IFileReferences
{
    Task<bool> Available(Guid actor, Guid id, bool imageOnly, CancellationToken ct);
    Task<bool> Public(Guid id, CancellationToken ct);
}
