using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Payments;
using TemplateV4.Infrastructure.Payments;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddPayments(IServiceCollection services)
    {
        services.AddScoped<IPaymentMethodConfiguration, PaymentMethodConfiguration>();
        services.AddScoped<IPaymentProviderRegistry, PaymentProviderRegistry>();
        services.AddHttpClient<StripePaymentProvider>(http => http.Timeout = TimeSpan.FromSeconds(20)).RemoveAllLoggers();
        services.AddHttpClient<PayFastPaymentProvider>(http => http.Timeout = TimeSpan.FromSeconds(20)).RemoveAllLoggers();
        services.AddScoped<IPaymentProvider>(provider => provider.GetRequiredService<StripePaymentProvider>());
        services.AddScoped<IPaymentProvider>(provider => provider.GetRequiredService<PayFastPaymentProvider>());
        services.AddScoped<IPaymentCallbackVerifier>(provider => provider.GetRequiredService<StripePaymentProvider>());
        services.AddScoped<IPaymentCallbackVerifier>(provider => provider.GetRequiredService<PayFastPaymentProvider>());
    }
}
