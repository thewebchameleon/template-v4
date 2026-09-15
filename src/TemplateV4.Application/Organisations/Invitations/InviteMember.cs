namespace TemplateV4.Application.Customers;

public sealed record CustomerInvitation(Guid Id, Guid CustomerId, string CustomerName, string Role, DateTimeOffset ExpiresAt);
public sealed record InviteMember(string Email, string Role);
