using TemplateV4.Application.Platform;

namespace TemplateV4.ApiService.Endpoints;

public static class UpdateEndpoints
{
    public static RouteGroupBuilder MapUpdateEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/updates", async (IUpdates updates, HttpResponse response, CancellationToken ct) =>
        {
            response.Headers.CacheControl = "no-store";
            return Results.Ok(await updates.Read(ct));
        }).RequireAuthorization(policy => policy.RequireRole("Administrator"))
            .WithName("GetReleaseUpdates").Produces<UpdateSummary>();
        return group;
    }
}
