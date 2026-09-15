using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Storage;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddMyFiles(IServiceCollection services)
    {
        services.AddScoped<MyFilesService>();
        services.AddScoped<OrganisationFiles>();
        services.AddScoped<TemplateV4.Application.Crm.IOrganisationAttachments, OrganisationAttachments>();
        services.AddScoped<FileRetention>();
        services.AddScoped<IMyFilesModuleSettings, MyFilesModuleSettingsStore>();
        services.AddScoped<IHandler<SaveMyFilesModuleSettings, MyFilesModuleSettings>, SaveMyFilesModuleSettingsHandler>();
        services.AddSingleton<IValidator<SaveMyFilesModuleSettings>, SaveMyFilesModuleSettingsValidator>();
    }
}
