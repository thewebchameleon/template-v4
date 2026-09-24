using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using TemplateV4.Infrastructure;
using TemplateV4.Application;
using TemplateV4.Infrastructure.Persistence;
namespace TemplateV4.Bundled.Support;
public static class ModuleServices
{
    public static void Register(IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<SupportDb>((provider, options) => options
            .UseNpgsql(provider.GetRequiredService<FrameworkDb>().Database.GetDbConnection(), postgres => postgres.MigrationsHistoryTable("migrations", "support"))
            .AddInterceptors(provider.GetRequiredService<AuditCapture>()));
        services.AddScoped<TemplateV4.Application.Modules.IMigrationContributor, SupportMigrations>();
        services.AddScoped<TemplateV4.Application.Modules.IDemoDataContributor, SupportDemoData>();
        services.AddScoped<TemplateV4.Application.Privacy.IPrivacyContributor, TemplateV4.Infrastructure.Support.SupportPrivacy>();
        services.AddSingleton<IIntegrationContractContributor, TemplateV4.Infrastructure.Support.SupportIntegrationContracts>();
        SupportRegistration.AddSupport(services);
        services.AddScoped<IIntegrationConsumer, TemplateV4.Infrastructure.Support.ContactNotificationConsumer>();
    }
}
