using TemplateV4.Application;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class PlatformEndpoints
{
    public static RouteGroupBuilder MapPlatformEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/jobs/maintenance", async (Dispatcher<TriggerMaintenance, Guid> dispatcher, IFeatureFlags flags, IExecutionContext execution, HttpContext context, CancellationToken ct) =>
                !flags.Enabled("maintenance", execution)
                    ? Results.NotFound()
                    : (await dispatcher.Send(new(context.Request.Headers["Idempotency-Key"].FirstOrDefault()), ct)).ToHttp())
            .RequireAuthorization(Permissions.Jobs).WithName("TriggerMaintenance");
        group.MapGet("/features", async (IFeatureFlags flags, IExecutionContext context, IRuntimeModules modules, CancellationToken ct) =>
                Results.Ok(new { maintenance = flags.Enabled("maintenance", context), files = flags.Enabled("files", context) && await modules.Enabled("files", ct) }))
            .WithName("GetFeatures");

        return group;
    }
}
