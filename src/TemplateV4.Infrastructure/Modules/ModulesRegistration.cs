using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Modules;

namespace TemplateV4.Infrastructure;

public static class ModulesRegistration
{
    public static void AddModules(IServiceCollection services)
    {
        services.AddScoped<ICapabilities, CapabilityEvaluator>();
        services.AddScoped<IModuleActivation, ModuleActivationStore>();
        services.AddScoped<IHandler<SaveModuleActivation, ModuleActivation>, SaveModuleActivationHandler>();
        services.AddSingleton<IValidator<SaveModuleActivation>, SaveModuleActivationValidator>();
    }
}
