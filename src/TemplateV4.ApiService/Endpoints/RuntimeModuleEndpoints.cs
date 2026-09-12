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
        admin.MapGet("", async (IRuntimeModules modules, CancellationToken ct) => Results.Ok(await modules.Read(ct)))
            .WithName("ListRuntimeModules").Produces<RuntimeModule[]>();
        admin.MapPost("", async (SaveRuntimeModule request, Dispatcher<SaveRuntimeModule, RuntimeModule> dispatcher, CancellationToken ct) =>
            (await dispatcher.Send(request, ct)).ToHttp()).WithName("SaveRuntimeModule").Produces<RuntimeModule>();
        return group;
    }
}
