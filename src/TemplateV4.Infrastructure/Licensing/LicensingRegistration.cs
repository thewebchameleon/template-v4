using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Licensing;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddLicensing(IServiceCollection services)
    {
        services.AddSingleton<Licensing.LicenseConfiguration>();
        services.AddScoped<Licensing.LicenseStore>();
        services.AddScoped<IModuleLicenses>(p => p.GetRequiredService<Licensing.LicenseStore>());
        services.AddHttpClient<Licensing.LicenseClient>(http => http.Timeout = TimeSpan.FromSeconds(30))
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { AllowAutoRedirect = false }).RemoveAllLoggers();
    }
}
