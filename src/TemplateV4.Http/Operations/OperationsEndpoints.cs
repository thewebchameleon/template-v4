using System.Security.Claims;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure;

namespace TemplateV4.ApiService.Endpoints;

public static class OperationsEndpoints
{
    public static RouteGroupBuilder MapOperationsEndpoints(this RouteGroupBuilder group)
    {
        var jobs = group.MapGroup("/administration/background-jobs")
            .RequireAuthorization(Permissions.Settings)
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));
        jobs.MapGet("", async (OperationsService service, CancellationToken ct, string search = "", string status = "all", int pageNumber = 1, int pageSize = 10, string sort = "id", string direction = "asc") =>
                (await service.ListBackgroundJobs(search, status, pageNumber, pageSize, sort, direction, ct)).ToHttp())
            .WithName("ListBackgroundJobs").Produces<BackgroundJobPage>();
        jobs.MapGet("/{id}", async (string id, OperationsService service, CancellationToken ct) =>
                (await service.GetBackgroundJob(id, ct)).ToHttp())
            .WithName("GetBackgroundJob").Produces<BackgroundJobDetail>();
        jobs.MapPost("/{id}/trigger", async (string id, Dispatcher<TriggerMaintenance, Guid> dispatcher, HttpContext context, CancellationToken ct) =>
                id == "maintenance" ? (await dispatcher.Send(new(context.Request.Headers["Idempotency-Key"].FirstOrDefault()), ct)).ToHttp() : Results.NotFound())
            .WithName("TriggerBackgroundJob");
        jobs.MapPost("/{id}/schedule", async (string id, BackgroundJobPauseRequest request, OperationsService service, ClaimsPrincipal principal, CancellationToken ct) =>
                (await service.SetBackgroundJobPaused(EndpointSecurity.Actor(principal), id, request, ct)).ToHttp())
            .WithName("SetBackgroundJobSchedule").Produces<BackgroundJobSummary>();
        jobs.MapPost("/{id}/runs/{runId:guid}/retry", async (string id, Guid runId, OperationsService service, ClaimsPrincipal principal, CancellationToken ct) =>
                (await service.RetryBackgroundJob(EndpointSecurity.Actor(principal), id, runId, ct)).ToHttp())
            .WithName("RetryBackgroundJobRun");

        group.MapGet("/operations", async (OperationsService service, CancellationToken ct, string kind = "message", int pageNumber = 1, int pageSize = 25, bool failedOnly = false, string sort = "availableAt", string direction = "asc") =>
                (await service.List(kind, pageNumber, pageSize, failedOnly, sort, direction, ct)).ToHttp())
            .RequireAuthorization(Permissions.Settings).WithName("GetDeliveryOperations").Produces<DeliveryPage>();
        group.MapPost("/operations/replay", async (ReplayRequest request, OperationsService service, ClaimsPrincipal principal, CancellationToken ct) =>
                (await service.Replay(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization(Permissions.Settings).WithName("ReplayDelivery");

        return group;
    }
}
