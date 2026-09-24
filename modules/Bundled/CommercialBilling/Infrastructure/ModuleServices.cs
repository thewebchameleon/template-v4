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
        services.AddDbContext<InvoicingDb>((provider, options) => options
            .UseNpgsql(provider.GetRequiredService<FrameworkDb>().Database.GetDbConnection(), postgres => postgres.MigrationsHistoryTable("migrations", "invoicing"))
            .AddInterceptors(provider.GetRequiredService<AuditCapture>()));
        services.AddScoped<TemplateV4.Application.Modules.IMigrationContributor, InvoicingMigrations>();
        services.AddScoped<TemplateV4.Application.Modules.IMigrationContributor, CommercialBillingMigrations>();
        services.AddScoped<TemplateV4.Application.Modules.IDemoDataContributor, CommercialBillingDemoData>();
        services.AddScoped<TemplateV4.Application.Invoicing.IInvoiceAttachments, TemplateV4.Infrastructure.Invoicing.InvoiceAttachments>();
        services.AddSingleton<IIntegrationContractContributor, TemplateV4.Infrastructure.Invoicing.InvoicePdfIntegrationContracts>();
        services.AddScoped<IIntegrationConsumer, TemplateV4.Infrastructure.Invoicing.InvoicePdfEmailConsumer>();
        InvoicingRegistration.AddInvoicing(services);
        CommercialBillingRegistration.AddCommercialBilling(services);
    }
}
