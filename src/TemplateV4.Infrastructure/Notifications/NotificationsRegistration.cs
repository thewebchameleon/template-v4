using Microsoft.Extensions.DependencyInjection;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddNotifications(IServiceCollection services)
    {
        services.AddScoped<NotificationService>();
        services.AddScoped<WebPushService>();
        services.AddHttpClient<WebPushSender>(http => http.Timeout = TimeSpan.FromSeconds(20))
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { AllowAutoRedirect = false }).RemoveAllLoggers();
    }
}
