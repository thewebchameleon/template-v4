using Microsoft.Extensions.DependencyInjection;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddInvoicing(IServiceCollection services)
    {
        services.AddScoped<TemplateV4.Application.Dashboards.IDashboardCardProvider, Invoicing.InvoicingDashboardCards>();
        services.AddScoped<Invoicing.InvoicingStore>();
        services.AddScoped<TemplateV4.Application.Invoicing.IInvoicing>(p => p.GetRequiredService<Invoicing.InvoicingStore>());
        services.AddScoped<TemplateV4.Application.Invoicing.ICommercialDocuments>(p => p.GetRequiredService<Invoicing.InvoicingStore>());
    }
}
