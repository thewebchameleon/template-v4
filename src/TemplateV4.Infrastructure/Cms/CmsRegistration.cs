using Microsoft.Extensions.DependencyInjection;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddCms(IServiceCollection services)
    {
        services.AddScoped<TemplateV4.Application.Cms.IContentCms, Cms.ContentStore>();
        services.AddScoped<TemplateV4.Application.Users.IAccessIndicators, Cms.CmsAccessIndicators>();
        services.AddScoped<TemplateV4.Application.Users.IScopedRoleDelegation, Cms.CmsRoleDelegation>();
        services.AddScoped<TemplateV4.Application.Platform.ISystemActionEligibility, Cms.CmsReviewEligibility>();
        services.AddScoped<TemplateV4.Application.Dashboards.IDashboardCardProvider, Cms.CmsDashboardCards>();
        services.AddScoped<TemplateV4.Application.Cms.ICms, Cms.CmsStore>();
        services.AddScoped<TemplateV4.Application.Cms.ICmsSections, Cms.CmsSectionsStore>();
    }
}
