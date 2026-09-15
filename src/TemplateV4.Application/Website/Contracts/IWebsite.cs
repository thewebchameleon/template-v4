namespace TemplateV4.Application.Website;

public sealed record BusinessDetails(string Name, string Description, string LogoUrl, string PrimaryColor,
    string Email, string Phone, string Address, string PublicUrl, string AdminUrl, string SeoTitle, string SeoDescription);
public sealed record WebsiteSettings(Guid Version, BusinessDetails Details, string NotificationEmail, bool Configured, bool Enabled);
public sealed record SaveWebsite(Guid Version, BusinessDetails Details, string NotificationEmail);
public sealed record SetWebsiteEnabled(Guid Version, bool Enabled);
public sealed record PublicWebsite(bool Enabled, BusinessDetails? Details, bool CmsEnabled, bool ContactEnabled);
public sealed record WebsiteImage(string Url);
public interface IWebsite
{
    Task<WebsiteSettings> Settings(CancellationToken ct);
    Task<Result<WebsiteSettings>> Save(SaveWebsite request, CancellationToken ct);
    Task<Result<WebsiteSettings>> Enable(SetWebsiteEnabled request, CancellationToken ct);
    Task<PublicWebsite> Public(CancellationToken ct);
    Task<string?> NotificationRecipient(CancellationToken ct);
    Task<Result<WebsiteImage>> Upload(byte[] bytes, CancellationToken ct);
    Task<(Stream Content, string ContentType)?> Image(Guid id, CancellationToken ct);
}
