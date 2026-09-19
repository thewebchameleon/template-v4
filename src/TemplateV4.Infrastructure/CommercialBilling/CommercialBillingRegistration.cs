using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.CommercialBilling;
using TemplateV4.Application.FileStorage;
using TemplateV4.Infrastructure.CommercialBilling;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddCommercialBilling(IServiceCollection services)
    {
        services.AddScoped<CommercialBillingStore>();
        services.AddScoped<ICommercialBilling>(provider => provider.GetRequiredService<CommercialBillingStore>());
        services.AddScoped<ICommercialEntitlements, CommercialEntitlements>();
        services.AddScoped<IStorageAllowanceSource, CommercialStorageAllowance>();
        services.AddScoped<CommercialBillingCallbacks>();
    }
}
