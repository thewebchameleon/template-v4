using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.FileStorage;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Storage;

namespace TemplateV4.Infrastructure;

public static class FileStorageRegistration
{
    public static void AddFileStorage(IServiceCollection services)
    {
        services.AddScoped<FileStorageService>();
        services.AddScoped<IFileReferences, FileReferences>();
        services.AddScoped<IFileShareNotifier, FileShareNotifier>();
        services.AddScoped<IStorageCapacity, StorageCapacity>();
        services.AddScoped<IStorageUsage, StorageUsage>();
        services.AddScoped<IStorageQuota, StorageQuota>();
        services.AddScoped<OrganisationFiles>();
        services.AddScoped<TemplateV4.Application.Crm.IOrganisationAttachments, OrganisationAttachments>();
        services.AddScoped<FileRetention>();
        services.AddScoped<IFileStorageModuleSettings, FileStorageModuleSettingsStore>();
        services.AddScoped<IHandler<SaveFileStorageModuleSettings, FileStorageModuleSettings>, SaveFileStorageModuleSettingsHandler>();
        services.AddSingleton<IValidator<SaveFileStorageModuleSettings>, SaveFileStorageModuleSettingsValidator>();
        services.AddScoped<IHandler<PurgeAllFileStorageData, Unit>, PurgeAllFileStorageDataHandler>();
        services.AddSingleton<IValidator<PurgeAllFileStorageData>, PurgeAllFileStorageDataValidator>();
    }
}
