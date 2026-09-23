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

public sealed class StorageUsage(FrameworkDb db, IEnumerable<IStorageUsageSource>? sources = null) : IStorageUsage
{
    public async Task<long> Read(CancellationToken ct)
    {
        var total = await db.Files.Where(x => x.PurgedAt == null).SumAsync(x => x.Size, ct);
        foreach (var source in sources ?? []) total = checked(total + await source.Read(ct));
        return total;
    }
}

public sealed class StorageQuota(FrameworkDb db, IStorageCapacity capacity, IStorageUsage usage) : IStorageQuota
{
    public async Task<bool> Fits(long currentBytes, long replacementBytes, CancellationToken ct)
    {
        if (currentBytes < 0 || replacementBytes < 0) throw new ArgumentOutOfRangeException();
        if (db.Database.CurrentTransaction is null)
            throw new InvalidOperationException("Storage quota admission requires an active database transaction.");

        await ModuleLocks.Organisation(db, ct);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({TemplateV4.Application.Customers.Organisation.Id.ToString()}, 0))", ct);
        if (replacementBytes <= currentBytes) return true;

        var limit = await capacity.Limit(ct);
        if (limit < 0) return true;
        var usedWithoutCurrent = Math.Max(0, await usage.Read(ct) - currentBytes);
        return usedWithoutCurrent <= limit && replacementBytes <= limit - usedWithoutCurrent;
    }
}
