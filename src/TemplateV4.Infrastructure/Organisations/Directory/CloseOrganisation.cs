using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Customers;

public sealed partial class CustomerStore
{
    public async Task<Result<Unit>> Close(Guid actor, Guid customer, Guid version, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await CustomerAccess.MutationLock(db, ct); await Lock(customer, ct);
        var info = await Managed(actor, customer, ct);
        if (info is null) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        if (info.Version != version) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (await entitlements.HasObligations(customer, ct)) return Result.Fail("customers.deletion_obligations", ErrorKind.Conflict);
        foreach (var obligation in obligations)
            if (await obligation.PreventsClosure(customer, ct)) return Result.Fail("customers.deletion_obligations", ErrorKind.Conflict);
        var now = time.GetUtcNow();
        await db.Users.Where(x => x.CurrentOrganisationId == customer).ExecuteUpdateAsync(x => x.SetProperty(u => u.CurrentOrganisationId, (Guid?)null), ct);
        await db.Set<MembershipRow>().Where(x => x.CustomerId == customer).ExecuteDeleteAsync(ct);
        await db.Set<CustomerInviteRow>().Where(x => x.CustomerId == customer).ExecuteDeleteAsync(ct);
        await db.Set<TemplateV4.Infrastructure.Storage.OrganisationFileRow>().Where(x => x.CustomerId == customer && x.DeletedAt == null)
            .ExecuteUpdateAsync(x => x.SetProperty(f => f.DeletedAt, now), ct);
        await db.Set<CustomerRow>().Where(x => x.Id == customer).ExecuteUpdateAsync(x => x.SetProperty(c => c.ClosedAt, now).SetProperty(c => c.Name, "Closed organisation"), ct);
        await Complete(actor, customer, "customer.closed", ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
