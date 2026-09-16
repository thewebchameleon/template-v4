using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Customers;

public sealed class CustomerAccess(FrameworkDb db) : ICustomerAccess
{
    public Task Lock(CancellationToken ct) => MutationLock(db, ct);
    public async Task<CustomerInfo?> Find(Guid actor, CancellationToken ct)
    {
        if (!await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct) || !await db.Users.AnyAsync(x => x.Id == actor && x.EmailConfirmed && (x.RegistrationState == "Approved" || x.RegistrationState == "NotRequired"), ct)) return null;
        var row = await db.Set<CustomerRow>().AsNoTracking().SingleAsync(ct);
        var administrator = await (from assignment in db.UserRoles
                                   join role in db.Roles on assignment.RoleId equals role.Id
                                   where assignment.UserId == actor && role.Name == "Administrator"
                                   select assignment).AnyAsync(ct);
        return new(row.Id, row.Name, administrator, await db.Profiles.CountAsync(x => !x.Disabled, ct), row.Version);
    }
    public static Task MutationLock(FrameworkDb db, CancellationToken ct) => db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842002)", ct);
}
