namespace TemplateV4.Application.Support;

public sealed record SupportModuleSettings(bool TicketsEnabled, Guid Version);
public interface ISupportModuleSettings
{
    Task<Result<SupportModuleSettings>> Read(CancellationToken ct);
    Task<Result<SupportModuleSettings>> Save(SaveSupportModuleSettings request, CancellationToken ct);
}
public sealed record SaveSupportModuleSettings(bool TicketsEnabled, Guid Version)
    : ICommand<SupportModuleSettings>, IAuthorizedRequest
{
    public string Permission => Users.Permissions.Settings;
}
public sealed class SaveSupportModuleSettingsValidator : IValidator<SaveSupportModuleSettings>
{
    public Dictionary<string, string[]> Validate(SaveSupportModuleSettings request)
        => request.Version == Guid.Empty ? new() { ["settings"] = ["validation.failed"] } : [];
}
public sealed class SaveSupportModuleSettingsHandler(ISupportModuleSettings settings) : IHandler<SaveSupportModuleSettings, SupportModuleSettings>
{
    public Task<Result<SupportModuleSettings>> Handle(SaveSupportModuleSettings request, CancellationToken ct) => settings.Save(request, ct);
}
