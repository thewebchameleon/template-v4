using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Platform;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddUpdates(IServiceCollection services)
    {
        services.AddSingleton<Updates.UpdateConfiguration>();
        services.AddScoped<Updates.UpdateStore>();
        services.AddScoped<IUpdates>(p => p.GetRequiredService<Updates.UpdateStore>());
        services.AddHttpClient<Updates.UpdateFeedClient>(http => http.Timeout = TimeSpan.FromSeconds(30))
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { AllowAutoRedirect = false }).RemoveAllLoggers();
    }
}
