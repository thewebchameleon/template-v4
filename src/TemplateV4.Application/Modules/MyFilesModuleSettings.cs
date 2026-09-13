namespace TemplateV4.Application.Modules;

public sealed record MyFilesModuleSettings(bool DemoMode, bool SlowUploadMode, Guid Version);
public sealed record SaveMyFilesModuleSettings(bool DemoMode, bool SlowUploadMode, Guid Version) : ICommand<MyFilesModuleSettings>, IAuthorizedRequest
{ public string Permission => Users.Permissions.Settings; }
public interface IMyFilesModuleSettings
{
    Task<MyFilesModuleSettings> Read(CancellationToken ct);
    Task<Result<MyFilesModuleSettings>> Save(SaveMyFilesModuleSettings request, CancellationToken ct);
}
public sealed class SaveMyFilesModuleSettingsValidator : IValidator<SaveMyFilesModuleSettings>
{
    public Dictionary<string, string[]> Validate(SaveMyFilesModuleSettings request)
        => request.Version == Guid.Empty ? new() { ["version"] = ["validation.failed"] } : [];
}
public sealed class SaveMyFilesModuleSettingsHandler(IMyFilesModuleSettings settings) : IHandler<SaveMyFilesModuleSettings, MyFilesModuleSettings>
{
    public Task<Result<MyFilesModuleSettings>> Handle(SaveMyFilesModuleSettings request, CancellationToken cancellationToken) => settings.Save(request, cancellationToken);
}
