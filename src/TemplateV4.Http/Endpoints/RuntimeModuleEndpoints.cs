using TemplateV4.Application;
using TemplateV4.Application.Modules;
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
        admin.MapGet("/my-files/settings", async (IMyFilesModuleSettings settings, CancellationToken ct) => Results.Ok(await settings.Read(ct)))
            .WithName("GetMyFilesModuleSettings").Produces<MyFilesModuleSettings>();
        admin.MapPost("/my-files/settings", async (SaveMyFilesModuleSettings request, Dispatcher<SaveMyFilesModuleSettings, MyFilesModuleSettings> dispatcher, CancellationToken ct) =>
            (await dispatcher.Send(request, ct)).ToHttp()).WithName("SaveMyFilesModuleSettings").Produces<MyFilesModuleSettings>();
        return group;
    }
}
