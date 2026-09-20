using TemplateV4.Application.Distribution;

namespace TemplateV4.ApiService.Endpoints;

public static class PrivateModuleEndpoints
{
    public static RouteGroupBuilder MapPrivateModuleEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/private-modules", (IPrivateModuleRegistration registration, HttpResponse response) =>
        {
            response.Headers.CacheControl = "no-store";
            return Results.Ok(registration.Status());
        }).RequireAuthorization(policy => policy.RequireRole("Administrator").RequireClaim("permission", "settings.manage"))
            .WithName("GetPrivateModuleRegistration").Produces<PrivateModuleRegistrationStatus>();

        group.MapPost("/private-modules/register", async (RegisterPrivateModuleApp request, IPrivateModuleRegistration registration, HttpResponse response, CancellationToken ct) =>
        {
            response.Headers.CacheControl = "no-store";
            try { return Results.Ok(await registration.Register(request, ct)); }
            catch (ArgumentException) { return Results.ValidationProblem(new Dictionary<string, string[]> { ["registration"] = ["Invalid registration details."] }); }
            catch (HttpRequestException) { return Results.Problem(statusCode: 503, title: "Module distribution service unavailable"); }
        }).RequireAuthorization(policy => policy.RequireRole("Administrator").RequireClaim("permission", "settings.manage"))
            .WithName("RegisterPrivateModuleApp").Produces<PrivateModuleRegistration>();
        return group;
    }
}
