using Microsoft.Extensions.DependencyInjection;

namespace TemplateV4.Infrastructure;

public static class ActionItemsRegistration
{
    public static void AddActionItems(IServiceCollection services)
    {
        services.AddScoped<TemplateV4.Application.Platform.IActionItems, ActionItemsService>();
    }
}
