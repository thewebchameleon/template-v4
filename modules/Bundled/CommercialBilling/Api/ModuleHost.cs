using TemplateV4.ApiService.Endpoints;
namespace TemplateV4.Bundled.CommercialBilling;
public static class ModuleHost
{
    public static void Map(WebApplication app)
    {
        app.MapGroup("/api/v1/auth").WithTags("Framework").RequireRateLimiting("auth").AddAuthSecurity(app.Configuration.GetSection("Web:AllowedOrigins").Get<string[]>() ?? []).MapCommercialBillingEndpoints();
        app.MapCommercialBillingCallbacks();
    }
}
