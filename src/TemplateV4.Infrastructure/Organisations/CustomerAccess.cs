using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Customers;

public sealed class CustomerAccess(FrameworkDb db, IConfiguration configuration) : ICustomerAccess
{
    public string Mode { get; } = configuration["Customers:Mode"] ?? "Both";
    public Task Lock(Guid customer, CancellationToken ct) => db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({customer.ToString()}, 0))", ct);
    public Task<Guid?> Personal(Guid actor, CancellationToken ct) => db.Set<CustomerRow>().Where(x => x.PersonalUserId == actor).Select(x => (Guid?)x.Id).SingleOrDefaultAsync(ct);
    public async Task<CustomerInfo?> Find(Guid actor, Guid customer, CancellationToken ct)
    {
        if (!await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct)) return null;
        var row = await db.Set<CustomerRow>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == customer && x.ClosedAt == null, ct);
        if (row is null || row.PersonalUserId != null && (Mode == "Organisations" || row.PersonalUserId != actor) || row.PersonalUserId == null && Mode == "Personal") return null;
        var role = row.PersonalUserId == actor ? "Owner" : await db.Set<MembershipRow>().Where(x => x.CustomerId == customer && x.UserId == actor).Select(x => x.Role).SingleOrDefaultAsync(ct);
        return role is null ? null : new(row.Id, row.Name, row.PersonalUserId == null ? "Organisation" : "Personal", role, row.PersonalUserId == null ? await db.Set<MembershipRow>().CountAsync(x => x.CustomerId == customer, ct) : 1, row.Version);
    }
    public static Task MutationLock(FrameworkDb db, CancellationToken ct) => db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842002)", ct);
}
