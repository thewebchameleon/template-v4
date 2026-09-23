using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Distribution;

namespace TemplateV4.Infrastructure;

public static class DistributionRegistration
{
    public static void AddPrivateModuleDistribution(IServiceCollection services)
    {
        services.AddSingleton<Distribution.PrivateModuleDistributionConfiguration>();
        services.AddHttpClient<IPrivateModuleRegistration, Distribution.PrivateModuleRegistrationClient>(http => http.Timeout = TimeSpan.FromSeconds(30))
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { AllowAutoRedirect = false })
            .RemoveAllLoggers();
    }
}
