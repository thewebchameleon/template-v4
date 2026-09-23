using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Customers;
using TemplateV4.Domain.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Customers;

public sealed partial class CustomerStore
{
    public async Task<Result<Unit>> Rename(Guid actor, RenameOrganisation request, CancellationToken ct)
    {
        if (!CustomerRules.ValidName(request.Name)) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Session.BeginTransactionAsync(ct); await Lock(ct);
        var info = await Managed(actor, ct);
        if (info is null) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        if (info.Version != request.Version) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        await db.Set<CustomerRow>().Where(x => x.Id == Organisation.Id).ExecuteUpdateAsync(x => x.SetProperty(c => c.Name, request.Name.Trim()), ct);
        await Complete(actor, "customer.renamed", ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
