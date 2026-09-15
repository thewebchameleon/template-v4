
namespace TemplateV4.Application.Modules;

public sealed record MyFilesModuleSettings(bool DemoMode, bool SlowUploadMode, Guid Version, int DemoExpiryMinutes = 60);
public interface IMyFilesModuleSettings
{
    Task<MyFilesModuleSettings> Read(CancellationToken ct);
    Task<Result<MyFilesModuleSettings>> Save(SaveMyFilesModuleSettings request, CancellationToken ct);
}
