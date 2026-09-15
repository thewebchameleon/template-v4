
namespace TemplateV4.Application.Modules;

public sealed record SaveMyFilesModuleSettings(bool DemoMode, bool SlowUploadMode, Guid Version, string? Password = null) : ICommand<MyFilesModuleSettings>, IAuthorizedRequest
{
    public string Permission => Users.Permissions.Settings;
    public override string ToString() => $"SaveMyFilesModuleSettings {{ DemoMode = {DemoMode}, SlowUploadMode = {SlowUploadMode}, Version = {Version} }}";
}
public sealed class SaveMyFilesModuleSettingsValidator : IValidator<SaveMyFilesModuleSettings>
{
    public Dictionary<string, string[]> Validate(SaveMyFilesModuleSettings request)
        => request.Version == Guid.Empty || request.Password is { Length: > 1024 } ? new() { ["settings"] = ["validation.failed"] } : [];
}
public sealed class SaveMyFilesModuleSettingsHandler(IMyFilesModuleSettings settings) : IHandler<SaveMyFilesModuleSettings, MyFilesModuleSettings>
{
    public Task<Result<MyFilesModuleSettings>> Handle(SaveMyFilesModuleSettings request, CancellationToken cancellationToken) => settings.Save(request, cancellationToken);
}
