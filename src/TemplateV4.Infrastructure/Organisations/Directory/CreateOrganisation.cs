using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Customers;
using TemplateV4.Domain.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Customers;

public sealed partial class CustomerStore
{
    public async Task<Result<CustomerInfo>> Create(Guid actor, CreateOrganisation request, CancellationToken ct)
    {
        if (!CustomerRules.ValidName(request.Name)) return Result<CustomerInfo>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await CustomerAccess.MutationLock(db, ct);
        if (access.Mode == "Personal" || !await Administrator(actor, ct)) return Result<CustomerInfo>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (await db.Set<MembershipRow>().CountAsync(x => x.UserId == actor, ct) >= 100) return Result<CustomerInfo>.Fail("customers.limit", ErrorKind.Conflict);
        var row = new CustomerRow { Name = request.Name.Trim() }; db.Set<CustomerRow>().Add(row);
        db.Set<MembershipRow>().Add(new() { CustomerId = row.Id, UserId = actor, Role = "Owner" }); Audit(actor, row.Id, "customer.created");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<CustomerInfo>.Success(new(row.Id, row.Name, "Organisation", "Owner", 1, row.Version));
    }
}
