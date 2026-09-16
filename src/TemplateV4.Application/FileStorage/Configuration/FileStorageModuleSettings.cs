
namespace TemplateV4.Application.Modules;

public sealed record FileStorageModuleSettings(bool DemoMode, bool SlowUploadMode, Guid Version, int DemoExpiryMinutes = 60);
public interface IFileStorageModuleSettings
{
    Task<FileStorageModuleSettings> Read(CancellationToken ct);
    Task<Result<FileStorageModuleSettings>> Save(SaveFileStorageModuleSettings request, CancellationToken ct);
}
