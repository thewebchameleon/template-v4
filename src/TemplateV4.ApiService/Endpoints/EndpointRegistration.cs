using TemplateV4.Application;

namespace TemplateV4.ApiService.Endpoints;

public static class EndpointRegistration
{
    public static WebApplication MapApiEndpoints(this WebApplication app, string[] allowedOrigins, CultureCatalog cultures)
    {
        app.MapGroup("/api/v1/auth")
            .WithTags("Framework")
            .RequireRateLimiting("auth")
            .AddAuthSecurity(allowedOrigins)
            .MapAuthenticationEndpoints(cultures)
            .MapSecurityEndpoints()
            .MapOperationsEndpoints();

        app.MapGroup("/api/v1/bootstrap")
            .WithTags("Framework")
            .RequireRateLimiting("auth")
            .AddBootstrapSecurity(allowedOrigins)
            .MapBootstrapEndpoints();

        app.MapGroup("/api/v1")
            .WithTags("Framework")
            .RequireAuthorization()
            .RequireRateLimiting("api")
            .MapUserEndpoints()
            .MapPlatformEndpoints();

        return app;
    }
}
