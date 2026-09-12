using TemplateV4.Application.Users;

namespace TemplateV4.Application.Customers;

public sealed record CustomerInfo(Guid Id, string Name, string Kind, string Role, int Members, Guid Version);
public sealed record CustomerHome(string Mode, CustomerInfo[] Accounts, CustomerInvitation[] Invitations);
public sealed record CustomerInvitation(Guid Id, Guid CustomerId, string CustomerName, string Role, DateTimeOffset ExpiresAt);
public sealed record CustomerMember(Guid UserId, string Name, string Email, string Role);
public sealed record CreateOrganization(string Name);
public sealed record RenameOrganization(string Name, Guid Version);
public sealed record InviteMember(string Email, string Role);
public sealed record ChangeMember(Guid UserId, string Role, Guid Version);
public interface ICustomerAccess
{
    Task<CustomerInfo?> Find(Guid actor, Guid customer, CancellationToken ct);
    Task<Guid?> Personal(Guid actor, CancellationToken ct);
    Task Lock(Guid customer, CancellationToken ct);
}
public interface ICustomers : ICustomerAccess
{
    Task<Result<CustomerHome>> Home(Guid actor, CancellationToken ct);
    Task<Result<CustomerInfo>> Create(Guid actor, CreateOrganization request, CancellationToken ct);
    Task<Result<Unit>> Rename(Guid actor, Guid customer, RenameOrganization request, CancellationToken ct);
    Task<Result<Page<CustomerMember>>> Members(Guid actor, Guid customer, int pageNumber, int pageSize, string sort, string direction, CancellationToken ct);
    Task<Result<Unit>> Invite(Guid actor, Guid customer, InviteMember request, CancellationToken ct);
    Task<Result<Unit>> Accept(Guid actor, Guid invitation, CancellationToken ct);
    Task<Result<Unit>> RevokeInvitation(Guid actor, Guid customer, Guid invitation, CancellationToken ct);
    Task<Result<Unit>> Member(Guid actor, Guid customer, ChangeMember request, CancellationToken ct);
    Task<Result<Unit>> Remove(Guid actor, Guid customer, Guid user, Guid version, CancellationToken ct);
    Task<Result<Unit>> Transfer(Guid actor, Guid customer, Guid user, Guid version, CancellationToken ct);
}
