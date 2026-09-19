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
