using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using TemplateV4.Infrastructure;
using TemplateV4.Application;
using TemplateV4.Infrastructure.Persistence;
namespace TemplateV4.Bundled.Crm;
public static class ModuleServices
{
    public static void Register(IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<CrmDb>((provider, options) => options
            .UseNpgsql(provider.GetRequiredService<FrameworkDb>().Database.GetDbConnection(), postgres => postgres.MigrationsHistoryTable("migrations", "crm"))
            .AddInterceptors(provider.GetRequiredService<AuditCapture>()));
        services.AddScoped<TemplateV4.Application.Modules.IMigrationContributor, CrmMigrations>();
        services.AddScoped<TemplateV4.Application.Modules.IDemoDataContributor, CrmDemoData>();
        services.AddScoped<TemplateV4.Application.Privacy.IPrivacyContributor, TemplateV4.Infrastructure.Crm.CrmPrivacy>();
        CrmRegistration.AddCrm(services);
    }
}
