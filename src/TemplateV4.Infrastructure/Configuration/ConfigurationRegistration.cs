using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Platform;

namespace TemplateV4.Infrastructure;

public static class ConfigurationRegistration
{
    public static void AddConfiguration(IServiceCollection services)
    {
        services.AddScoped<IPlatformAppearance, PlatformAppearanceStore>();
        services.AddScoped<IHandler<SavePlatformAppearance, PlatformAppearance>, SavePlatformAppearanceHandler>();
        services.AddSingleton<IValidator<SavePlatformAppearance>, SavePlatformAppearanceValidator>();
    }
}
