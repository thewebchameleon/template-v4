namespace TemplateV4.Application.Customers;

public sealed record CustomerMember(Guid UserId, string Name, string Email, string Role);
public sealed record ChangeMember(Guid UserId, string Role, Guid Version);
