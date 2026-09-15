using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Billing;
using TemplateV4.Application.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Customers;

public sealed partial class CustomerStore(FrameworkDb db, CustomerAccess access, IStorageEntitlements entitlements, TimeProvider time, UserManager<AppUser> users, IEnumerable<IOrganisationObligations> obligations) : ICustomers
{
    public Task Lock(Guid customer, CancellationToken ct) => access.Lock(customer, ct);
    public Task<Guid?> Personal(Guid actor, CancellationToken ct) => access.Personal(actor, ct);
    public Task<CustomerInfo?> Find(Guid actor, Guid customer, CancellationToken ct) => access.Find(actor, customer, ct);
    private async Task<bool> Administrator(Guid actor, CancellationToken ct) =>
        await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct) &&
        await (from assignment in db.UserRoles
               join role in db.Roles on assignment.RoleId equals role.Id
               where assignment.UserId == actor && role.Name == "Administrator"
               select assignment).AnyAsync(ct);
    private void Audit(Guid actor, Guid customer, string action) => db.Audit.Add(new() { ActorId = actor, SubjectId = customer, SubjectType = "customer", Action = action, At = time.GetUtcNow() });
    private async Task Complete(Guid actor, Guid customer, string action, CancellationToken ct)
    {
        await db.Set<CustomerRow>().Where(x => x.Id == customer).ExecuteUpdateAsync(x => x.SetProperty(c => c.Version, Guid.NewGuid()), ct);
        Audit(actor, customer, action); await db.SaveChangesAsync(ct);
    }
}
