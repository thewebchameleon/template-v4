using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using TemplateV4.Infrastructure;
using TemplateV4.Application;
using TemplateV4.Infrastructure.Persistence;
namespace TemplateV4.Bundled.Cms;
public static class ModuleServices
{
    public static void Register(IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<CmsDb>((provider, options) => options
            .UseNpgsql(provider.GetRequiredService<FrameworkDb>().Database.GetDbConnection(), postgres => postgres.MigrationsHistoryTable("migrations", "cms"))
            .AddInterceptors(provider.GetRequiredService<AuditCapture>()));
        services.AddScoped<TemplateV4.Application.Modules.IMigrationContributor, CmsMigrations>();
        services.AddScoped<TemplateV4.Application.Modules.IDemoDataContributor, CmsDemoData>();
        services.AddScoped<TemplateV4.Application.ApiKeys.IApiKeyCollections, TemplateV4.Infrastructure.Cms.CmsApiKeyCollections>();
        CmsRegistration.AddCms(services);
    }
}
