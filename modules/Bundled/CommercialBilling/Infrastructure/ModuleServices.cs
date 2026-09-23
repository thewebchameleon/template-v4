using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using TemplateV4.Infrastructure;
using TemplateV4.Application;
using TemplateV4.Infrastructure.Persistence;
namespace TemplateV4.Bundled.CommercialBilling;
public static class ModuleServices
{
    public static void Register(IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<CommercialBillingDb>((provider, options) => options
            .UseNpgsql(provider.GetRequiredService<FrameworkDb>().Database.GetDbConnection(), postgres => postgres.MigrationsHistoryTable("migrations", "commercial_billing"))
            .AddInterceptors(provider.GetRequiredService<AuditCapture>()));
        services.AddScoped<TemplateV4.Application.Modules.IMigrationContributor, CommercialBillingMigrations>();
        CommercialBillingRegistration.AddCommercialBilling(services);
    }
}
