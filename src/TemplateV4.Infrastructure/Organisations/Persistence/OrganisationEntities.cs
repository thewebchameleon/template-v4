using TemplateV4.Application.Customers;

namespace TemplateV4.Infrastructure.Persistence;

public sealed class CustomerRow
{
    public Guid Id { get; set; } = Organisation.Id;
    public string Name { get; set; } = "";
    public string? WebsiteUrl { get; set; }
    public string? ContactEmail { get; set; }
    public string TimeZone { get; set; } = "";
    public string? Country { get; set; }
    public string? PrimaryContactNumber { get; set; }
    public Guid? LogoId { get; set; }
    public Guid Version { get; set; } = Guid.NewGuid();
}

public sealed class OrganisationLogoRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public byte[] Png { get; set; } = [];
}
