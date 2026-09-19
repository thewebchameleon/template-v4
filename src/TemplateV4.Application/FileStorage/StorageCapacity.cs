namespace TemplateV4.Application.FileStorage;

public interface IStorageCapacity
{
    Task<long> Limit(CancellationToken ct);
}

public interface IStorageAllowanceSource
{
    Task<long?> Limit(CancellationToken ct);
}

public interface IStorageUsage
{
    Task<long> Read(CancellationToken ct);
}

/// <summary>Contributes bytes owned by one upload workflow to organisation storage usage.</summary>
public interface IStorageUsageSource
{
    Task<long> Read(CancellationToken ct);
}

/// <summary>
/// Serializes organisation-wide upload admission and checks a replacement against the
/// effective storage allowance. Callers must persist the accepted change in the same
/// database transaction so concurrent upload paths cannot overbook the quota.
/// </summary>
public interface IStorageQuota
{
    Task<bool> Fits(long currentBytes, long replacementBytes, CancellationToken ct);
}
