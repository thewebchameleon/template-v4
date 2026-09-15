using Microsoft.Extensions.DependencyInjection;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddCrm(IServiceCollection services)
    {
        services.AddScoped<TemplateV4.Application.Crm.IOrganisationOperations, Crm.OrganisationOperations>();
        services.AddScoped<Crm.CrmStore>();
        services.AddScoped<TemplateV4.Application.Crm.IRecordAttachments, Crm.RecordAttachments>();
        services.AddScoped<TemplateV4.Application.Crm.ICrm>(p => p.GetRequiredService<Crm.CrmStore>());
        services.AddScoped<TemplateV4.Application.Crm.ICrmCustomers>(p => p.GetRequiredService<Crm.CrmStore>());
    }
}
