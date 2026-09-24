using Microsoft.Extensions.DependencyInjection;

namespace TemplateV4.Infrastructure;

public static class InvoicingRegistration
{
    public static void AddInvoicing(IServiceCollection services)
    {
        services.AddScoped<TemplateV4.Application.Dashboards.IDashboardCardProvider, Invoicing.InvoicingDashboardCards>();
        services.AddScoped<Invoicing.InvoicingStore>();
        services.AddHttpClient<Invoicing.InvoiceHtmlPdf>((provider, http) =>
        {
            var address = provider.GetRequiredService<Microsoft.Extensions.Configuration.IConfiguration>()["Pdf:RendererUrl"];
            if (!string.IsNullOrWhiteSpace(address)) http.BaseAddress = new Uri(address.TrimEnd('/') + "/");
            http.Timeout = TimeSpan.FromSeconds(60);
        });
        services.AddScoped<TemplateV4.Application.Invoicing.IInvoicing>(p => p.GetRequiredService<Invoicing.InvoicingStore>());
        services.AddScoped<TemplateV4.Application.Invoicing.ICommercialDocuments>(p => p.GetRequiredService<Invoicing.InvoicingStore>());
    }
}
