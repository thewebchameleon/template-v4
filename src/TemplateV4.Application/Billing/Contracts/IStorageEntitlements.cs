namespace TemplateV4.Application.Billing;

public interface IStorageEntitlements
{
    Task<long?> Quota(CancellationToken ct);
    Task<bool> CanStore(long additionalBytes, CancellationToken ct);
}
