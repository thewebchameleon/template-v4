using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Customers;
using TemplateV4.Infrastructure.Customers;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddOrganisations(IServiceCollection services, IConfiguration config)
    {
        if ((config["Customers:Mode"] ?? "Both") is not ("Both" or "Personal" or "Organisations")) throw new InvalidOperationException("Invalid Customers:Mode.");
        services.AddScoped<CustomerAccess>();
        services.AddScoped<ICustomerAccess>(p => p.GetRequiredService<CustomerAccess>());
        services.AddScoped<ICustomers, CustomerStore>();
    }
}
