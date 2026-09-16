using System.Net.Mail;

namespace TemplateV4.Application.Support;

public sealed record SupportModuleSettings(bool EnquiriesEnabled, bool TicketsEnabled, string NotificationEmail, Guid Version);
public interface ISupportModuleSettings
{
    Task<Result<SupportModuleSettings>> Read(CancellationToken ct);
    Task<Result<SupportModuleSettings>> Save(SaveSupportModuleSettings request, CancellationToken ct);
    Task<string?> NotificationRecipient(CancellationToken ct);
}
public sealed record SaveSupportModuleSettings(bool EnquiriesEnabled, bool TicketsEnabled, string NotificationEmail, Guid Version)
    : ICommand<SupportModuleSettings>, IAuthorizedRequest
{
    public string Permission => Users.Permissions.Settings;
}
public sealed class SaveSupportModuleSettingsValidator : IValidator<SaveSupportModuleSettings>
{
    public Dictionary<string, string[]> Validate(SaveSupportModuleSettings request)
        => request.Version == Guid.Empty || request.NotificationEmail is null or { Length: > 254 } ||
           request.NotificationEmail.Length > 0 && (!MailAddress.TryCreate(request.NotificationEmail, out var address) || address.Address != request.NotificationEmail)
            ? new() { ["settings"] = ["validation.failed"] } : [];
}
public sealed class SaveSupportModuleSettingsHandler(ISupportModuleSettings settings) : IHandler<SaveSupportModuleSettings, SupportModuleSettings>
{
    public Task<Result<SupportModuleSettings>> Handle(SaveSupportModuleSettings request, CancellationToken ct) => settings.Save(request, ct);
}
