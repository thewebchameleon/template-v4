using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application;

namespace TemplateV4.Infrastructure.Storage;

public interface IFileShareNotifier
{
    void Queue(string recipient, string culture, Guid fileId, string token);
    string ProtectToken(string token);
    string? UnprotectToken(string? protectedToken);
}

public sealed class FileShareNotifier(IEventOutbox outbox, IDataProtectionProvider protection, IConfiguration config) : IFileShareNotifier
{
    private readonly IDataProtector _recipient = protection.CreateProtector("TemplateV4.email.recipient.v1");
    private readonly IDataProtector _action = protection.CreateProtector("TemplateV4.email.action.v1");
    private readonly IDataProtector _token = protection.CreateProtector("TemplateV4.file-share.token.v1");

    public void Queue(string recipient, string culture, Guid fileId, string token)
    {
        var publicUrl = config["Web:PublicUrl"]?.TrimEnd('/') ?? throw new InvalidOperationException("Web:PublicUrl is required for file share invitations.");
        var url = $"{publicUrl}/shared-files/{fileId}#{token}";
        outbox.Add(new EmailRequest(Guid.Empty, EmailTemplate.FileShareInvitation, culture,
            ActionUrl: _action.Protect(url), ProtectedRecipient: _recipient.Protect(recipient)));
    }

    public string ProtectToken(string token) => _token.Protect(token);
    public string? UnprotectToken(string? protectedToken) => protectedToken is null ? null : _token.Unprotect(protectedToken);
}
