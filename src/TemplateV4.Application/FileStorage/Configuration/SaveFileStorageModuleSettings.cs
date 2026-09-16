
namespace TemplateV4.Application.Modules;

public sealed record SaveFileStorageModuleSettings(bool DemoMode, bool SlowUploadMode, Guid Version, string? Password = null) : ICommand<FileStorageModuleSettings>, IAuthorizedRequest
{
    public string Permission => Users.Permissions.Settings;
    public override string ToString() => $"SaveFileStorageModuleSettings {{ DemoMode = {DemoMode}, SlowUploadMode = {SlowUploadMode}, Version = {Version} }}";
}
public sealed class SaveFileStorageModuleSettingsValidator : IValidator<SaveFileStorageModuleSettings>
{
    public Dictionary<string, string[]> Validate(SaveFileStorageModuleSettings request)
        => request.Version == Guid.Empty || request.Password is { Length: > 1024 } ? new() { ["settings"] = ["validation.failed"] } : [];
}
public sealed class SaveFileStorageModuleSettingsHandler(IFileStorageModuleSettings settings) : IHandler<SaveFileStorageModuleSettings, FileStorageModuleSettings>
{
    public Task<Result<FileStorageModuleSettings>> Handle(SaveFileStorageModuleSettings request, CancellationToken cancellationToken) => settings.Save(request, cancellationToken);
}
