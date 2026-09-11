using TemplateV4.Application.Modules;

namespace TemplateV4.ApiService.Endpoints;

public static class ModuleEndpoints
{
    public static RouteGroupBuilder MapModuleEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/modules", (ModuleCatalog modules) => Results.Ok(
            modules.Definitions.ToDictionary(x => x.Id, x => modules.Enabled(x.Id))))
            .WithName("GetModules").Produces<Dictionary<string, bool>>();
        return group;
    }

    public static RouteHandlerBuilder RequireModule(this RouteHandlerBuilder endpoint, string module)
        => endpoint.AddEndpointFilter(async (invocation, next) =>
            invocation.HttpContext.RequestServices.GetRequiredService<ModuleCatalog>().Enabled(module)
                ? await next(invocation) : Results.NotFound());
}
