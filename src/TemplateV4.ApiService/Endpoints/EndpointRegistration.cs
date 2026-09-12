namespace TemplateV4.ApiService.Endpoints;

public static class EndpointRegistration
{
    public static WebApplication MapApiEndpoints(this WebApplication app, string[] allowedOrigins)
    {
        app.MapGroup("/api/v1/auth")
            .WithTags("Framework")
            .RequireRateLimiting("auth")
            .AddAuthSecurity(allowedOrigins)
            .MapAuthenticationEndpoints()
            .MapSecurityEndpoints()
            .MapOperationsEndpoints()
            .MapWorkspaceEndpoints()
            .MapConfigurationEndpoints()
            .MapRuntimeModuleEndpoints()
            .MapSupportEndpoints()
            .MapCustomerBillingEndpoints();

        app.MapPaymentCallbacks();

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
            .MapAccessEndpoints()
            .MapModuleEndpoints()
            .MapPlatformEndpoints();

        return app;
    }
}
