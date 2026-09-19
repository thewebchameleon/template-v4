namespace TemplateV4.Application.Customers;

public static class Organisation
{
    // Stable identity for retained payment references and shared storage keys.
    public static readonly Guid Id = new("00000000-0000-0000-0000-000000000001");
}
public sealed record CustomerInfo(Guid Id, string Name, string? WebsiteUrl, string? ContactEmail,
    string TimeZone, string? Country, string? PrimaryContactNumber, string? LogoUrl, bool CanManage, int Users, Guid Version,
    string[] TimeZones);
public sealed record OrganisationBrand(string Name, string? LogoUrl);
public sealed record OrganisationLogo(byte[] Png);
