using TemplateV4.Infrastructure.Security;

namespace TemplateV4.ApiService.Endpoints;

public static class BootstrapEndpoints
{
    public static RouteGroupBuilder MapBootstrapEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/status", async (AdminBootstrapService service, CancellationToken ct) =>
                Results.Ok(new AdminBootstrapStatus(await service.Available(ct))))
            .WithName("GetAdminBootstrapStatus").Produces<AdminBootstrapStatus>();
        group.MapPost("", async (AdminBootstrapRequest request, AdminBootstrapService service, CancellationToken ct) =>
        {
            var result = await service.Create(request, ct);
            return result.IsSuccess ? Results.NoContent() : ApiResults.Failure(result.Error!);
        }).WithName("CreateBootstrapAdministrator").Produces(StatusCodes.Status204NoContent);

        return group;
    }
}
