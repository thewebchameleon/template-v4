using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class PlatformEndpoints
{
    public static RouteGroupBuilder MapPlatformEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/jobs/maintenance", async (Dispatcher<TriggerMaintenance, Guid> dispatcher, HttpContext context, CancellationToken ct) =>
                (await dispatcher.Send(new(context.Request.Headers["Idempotency-Key"].FirstOrDefault()), ct)).ToHttp())
            .RequireAuthorization(Permissions.Jobs).WithName("TriggerMaintenance");

        return group;
    }
}
