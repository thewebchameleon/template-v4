namespace TemplateV4.Application.Customers;

public sealed record CustomerInfo(Guid Id, string Name, string Kind, string Role, int Members, Guid Version);
public sealed record CustomerHome(string Mode, CustomerInfo[] Accounts, CustomerInvitation[] Invitations, Guid? CurrentOrganisationId = null);
public sealed record SelectOrganisation(Guid OrganisationId);
