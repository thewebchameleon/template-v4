namespace TemplateV4.Application.Customers;

public sealed record RenameOrganisation(string Name, Guid Version);
public sealed record UpdateOrganisation(string Name, string? WebsiteUrl, string? ContactEmail,
    string TimeZone, string? Country, string? PrimaryContactNumber, Guid Version);
