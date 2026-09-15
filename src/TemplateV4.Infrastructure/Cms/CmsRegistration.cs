using Microsoft.Extensions.DependencyInjection;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddCms(IServiceCollection services)
    {
        services.AddScoped<TemplateV4.Application.Cms.ICms, Cms.CmsStore>();
        services.AddScoped<TemplateV4.Application.Cms.ICmsSections, Cms.CmsSectionsStore>();
    }
}
