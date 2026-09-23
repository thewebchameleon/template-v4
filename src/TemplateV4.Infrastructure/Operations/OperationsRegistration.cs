using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Users;

namespace TemplateV4.Infrastructure;

public static class OperationsRegistration
{
    public static void AddOperations(IServiceCollection services)
    {
        services.AddScoped<OperationsService>();
        services.AddScoped<IHandler<TriggerMaintenance, Guid>, TriggerMaintenanceHandler>();
    }
}
