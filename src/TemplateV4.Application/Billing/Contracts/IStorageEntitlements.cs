
namespace TemplateV4.Application.Billing;

public interface IStorageEntitlements
{
    Task<long?> Quota(Guid customer, CancellationToken ct);
    Task<bool> CanAddMember(Guid customer, int memberCount, CancellationToken ct);
    Task<bool> HasObligations(Guid customer, CancellationToken ct);
}
