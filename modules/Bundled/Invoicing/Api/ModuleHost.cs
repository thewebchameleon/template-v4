using TemplateV4.ApiService.Endpoints;
namespace TemplateV4.Bundled.Invoicing;
public static class ModuleHost
{
    public static void Configure(WebApplicationBuilder builder) { }
    public static void Map(WebApplication app)
    {
        var auth = app.MapGroup("/api/v1/auth").WithTags("Framework").RequireRateLimiting("auth").AddAuthSecurity(app.Configuration.GetSection("Web:AllowedOrigins").Get<string[]>() ?? []);
        auth.MapInvoicingEndpoints();
    }
}
