using TemplateV4.Application.Customers;

namespace TemplateV4.Infrastructure.Persistence;

public sealed class CustomerRow
{
    public Guid Id { get; set; } = Organisation.Id;
    public string Name { get; set; } = "Organisation";
    public Guid Version { get; set; } = Guid.NewGuid();
}
