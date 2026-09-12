using TemplateV4.Application.Modules;

namespace TemplateV4.ApiService.Endpoints;

public static class ModuleEndpoints
{
    public static RouteGroupBuilder MapModuleEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/modules", async (ModuleCatalog modules, IRuntimeModules runtime, CancellationToken ct) =>
        {
            var enabled = modules.Definitions.ToDictionary(x => x.Id, x => modules.Enabled(x.Id));
            enabled["files"] = await runtime.Enabled("files", ct);
            return Results.Ok(enabled);
        })
            .WithName("GetModules").Produces<Dictionary<string, bool>>();
        return group;
    }

    public static RouteHandlerBuilder RequireModule(this RouteHandlerBuilder endpoint, string module)
        => endpoint.AddEndpointFilter(async (invocation, next) =>
            (module == "files"
                ? await invocation.HttpContext.RequestServices.GetRequiredService<IRuntimeModules>().Enabled(module, invocation.HttpContext.RequestAborted)
                : invocation.HttpContext.RequestServices.GetRequiredService<ModuleCatalog>().Enabled(module))
                ? await next(invocation) : Results.NotFound());
}
