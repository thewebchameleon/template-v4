using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Customers;

namespace TemplateV4.Infrastructure.Crm;

public sealed class OrganisationOperations(ICustomerAccess access, TemplateV4.Infrastructure.Persistence.FrameworkDb db) : IOrganisationOperations
{
    public async Task<bool> Allowed(Guid actor, OrganisationOperation operation, CancellationToken ct)
    {
        var account = await access.Find(actor, ct);
        if (!Enum.IsDefined(operation) || account is null) return false;
        if (operation == OrganisationOperation.Configure) return account.CanManage;
        var permission = operation switch
        {
            OrganisationOperation.Operate => TemplateV4.Application.Users.Permissions.CrmManage,
            OrganisationOperation.Issue => TemplateV4.Application.Users.Permissions.InvoiceIssue,
            OrganisationOperation.Settle => TemplateV4.Application.Users.Permissions.InvoiceSettle,
            OrganisationOperation.Correct => TemplateV4.Application.Users.Permissions.InvoiceCorrect,
            _ => null
        };
        return permission is null || await (from membership in db.UserRoles
                                            join claim in db.RoleClaims on membership.RoleId equals claim.RoleId
                                            where membership.UserId == actor && claim.ClaimType == "permission" && claim.ClaimValue == permission
                                            select claim).AnyAsync(ct);
    }
}
