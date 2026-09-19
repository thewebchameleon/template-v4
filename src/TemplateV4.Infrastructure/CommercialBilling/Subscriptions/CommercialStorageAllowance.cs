using TemplateV4.Application.CommercialBilling;
using TemplateV4.Application.FileStorage;

namespace TemplateV4.Infrastructure.CommercialBilling;

public sealed class CommercialStorageAllowance(ICommercialEntitlements entitlements) : IStorageAllowanceSource
{
    public Task<long?> Limit(CancellationToken ct) => entitlements.Limit("storage-bytes", ct);
}
