using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Customers;

public sealed partial class CustomerStore(FrameworkDb db, CustomerAccess access, TimeProvider time,
    TemplateV4.Application.FileStorage.IStorageQuota storageQuota) : ICustomers
{
    public Task Lock(CancellationToken ct) => access.Lock(ct);
    public Task<CustomerInfo?> Find(Guid actor, CancellationToken ct) => access.Find(actor, ct);
    private void Audit(Guid actor, string action) => db.Audit.Add(new() { ActorId = actor, SubjectId = Organisation.Id, SubjectType = "customer", Action = action, At = time.GetUtcNow() });
    private async Task Complete(Guid actor, string action, CancellationToken ct)
    {
        await db.Set<CustomerRow>().Where(x => x.Id == Organisation.Id).ExecuteUpdateAsync(x => x.SetProperty(c => c.Version, Guid.NewGuid()), ct);
        Audit(actor, action); await db.SaveChangesAsync(ct);
    }
}
