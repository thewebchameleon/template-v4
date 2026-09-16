using TemplateV4.Application.Modules;
using TemplateV4.Application.Support;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class RuntimeModuleEndpoints
{
    public static RouteGroupBuilder MapRuntimeModuleEndpoints(this RouteGroupBuilder group)
    {
        var admin = group.MapGroup("/administration/modules").RequireAuthorization(Permissions.Settings)
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));
        admin.MapGet("/activation", async (IModuleActivation modules, CancellationToken ct) => Results.Ok(await modules.Read(ct)))
            .WithName("ListModuleActivations").Produces<ModuleActivation[]>();
        admin.MapPost("/activation", async (SaveModuleActivation request, Dispatcher<SaveModuleActivation, ModuleActivation> dispatcher, CancellationToken ct) =>
            (await dispatcher.Send(request, ct)).ToHttp()).WithName("SaveModuleActivation").Produces<ModuleActivation>();
        admin.MapGet("/file-storage/settings", async (IFileStorageModuleSettings settings, CancellationToken ct) => Results.Ok(await settings.Read(ct)))
            .WithName("GetFileStorageModuleSettings").Produces<FileStorageModuleSettings>();
        admin.MapPost("/file-storage/settings", async (SaveFileStorageModuleSettings request, Dispatcher<SaveFileStorageModuleSettings, FileStorageModuleSettings> dispatcher, CancellationToken ct) =>
            (await dispatcher.Send(request, ct)).ToHttp()).WithName("SaveFileStorageModuleSettings").Produces<FileStorageModuleSettings>();
        admin.MapGet("/support/settings", async (ISupportModuleSettings settings, CancellationToken ct) => (await settings.Read(ct)).ToHttp())
            .ContinuesWhenDisabled(ModuleIds.Support, "Feature settings remain editable while Support is disabled.")
            .WithName("GetSupportModuleSettings").Produces<SupportModuleSettings>();
        admin.MapPost("/support/settings", async (SaveSupportModuleSettings request, Dispatcher<SaveSupportModuleSettings, SupportModuleSettings> dispatcher, CancellationToken ct) =>
            (await dispatcher.Send(request, ct)).ToHttp())
            .ContinuesWhenDisabled(ModuleIds.Support, "Feature settings remain editable while Support is disabled.")
            .WithName("SaveSupportModuleSettings").Produces<SupportModuleSettings>();
        return group;
    }
}
