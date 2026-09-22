using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Dashboards;
using TemplateV4.Infrastructure.Dashboards;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddDashboards(IServiceCollection services)
    {
        services.AddScoped<IDashboards, DashboardStore>();
        services.AddScoped<DashboardAccess>();
        services.AddScoped<IDashboardCardProvider, CoreDashboardCards>();
    }
}
