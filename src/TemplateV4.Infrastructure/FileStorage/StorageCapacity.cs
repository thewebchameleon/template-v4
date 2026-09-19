using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.FileStorage;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed class StorageCapacity(FrameworkDb db, IEnumerable<IStorageAllowanceSource> sources) : IStorageCapacity
{
    public async Task<long> Limit(CancellationToken ct)
    {
        long? result = null;
        foreach (var source in sources)
        {
            var candidate = await source.Limit(ct);
            if (candidate is null) continue;
            if (result is not null) throw new InvalidOperationException("Multiple storage allowance sources are active.");
            result = candidate;
        }
        return result ?? await db.FileStorageSettings.AsNoTracking().Select(x => x.DefaultQuotaBytes).SingleAsync(ct);
    }
}

public sealed class StorageUsage(FrameworkDb db) : IStorageUsage
{
    public Task<long> Read(CancellationToken ct) =>
        db.Files.Where(x => x.PurgedAt == null).SumAsync(x => x.Size, ct);
}
