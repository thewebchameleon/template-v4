using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Billing;
using TemplateV4.Application.Customers;
using TemplateV4.Infrastructure.Billing;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddBilling(IServiceCollection services)
    {
        services.AddSingleton<PlanCatalog>();
        services.AddScoped<IStorageEntitlements, StorageEntitlements>();
        services.AddScoped<BillingStore>();
        services.AddScoped<IBilling>(p => p.GetRequiredService<BillingStore>());
        services.AddScoped<PaymentCallbacks>();
        services.AddHttpClient<StripeSubscriptions>(http => http.Timeout = TimeSpan.FromSeconds(20)).RemoveAllLoggers();
        services.AddHttpClient<PayFastSubscriptions>(http => http.Timeout = TimeSpan.FromSeconds(20)).RemoveAllLoggers();
    }
}
