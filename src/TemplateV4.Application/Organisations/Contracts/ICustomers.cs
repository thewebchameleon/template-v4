namespace TemplateV4.Application.Customers;

public interface ICustomerAccess
{
    Task<CustomerInfo?> Find(Guid actor, CancellationToken ct);
    Task Lock(CancellationToken ct);
}
public interface ICustomers : ICustomerAccess
{
    Task<Result<CustomerInfo>> Home(Guid actor, CancellationToken ct);
    Task<Result<TemplateV4.Application.Users.Page<OrganisationUser>>> Users(Guid actor, int pageNumber, int pageSize, CancellationToken ct);
    Task<Result<Unit>> Rename(Guid actor, RenameOrganisation request, CancellationToken ct);
}
public sealed record OrganisationUser(Guid UserId, string Name);
