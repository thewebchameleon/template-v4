using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Http.Resilience;
using Microsoft.Extensions.Logging;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;

namespace TemplateV4.ServiceDefaults;

public static class Hosting
{
    public static async Task<bool> HandleHealthProbe(string[] args)
    {
        if (!args.Contains("--health-check")) return false;
        try { using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(3) }; using var response = await client.GetAsync("http://127.0.0.1:8080/health/live"); Environment.ExitCode = response.IsSuccessStatusCode ? 0 : 1; }
        catch (HttpRequestException) { Environment.ExitCode = 1; }
        catch (TaskCanceledException) { Environment.ExitCode = 1; }
        return true;
    }
    public static T AddServiceDefaults<T>(this T builder) where T : IHostApplicationBuilder
    {
        builder.Logging.ClearProviders();
        builder.Logging.AddJsonConsole();
        builder.Services.AddServiceDiscovery();
        builder.Services.ConfigureHttpClientDefaults(http =>
        {
            http.AddServiceDiscovery();
            http.AddStandardResilienceHandler(options => options.Retry.DisableForUnsafeHttpMethods());
            http.RedactLoggedHeaders(_ => true);
        });
        builder.Services.AddHealthChecks().AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);
        var telemetry = builder.Services.AddOpenTelemetry()
            .WithMetrics(metrics => metrics.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation().AddRuntimeInstrumentation().AddMeter("templatev4"))
            .WithTracing(traces => traces.AddAspNetCoreInstrumentation(options => options.Filter = context => !context.Request.Path.StartsWithSegments("/health"))
                .AddHttpClientInstrumentation().AddSource("TemplateV4.*"));
        if (!string.IsNullOrWhiteSpace(builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]))
        {
            telemetry.WithMetrics(metrics => metrics.AddOtlpExporter()).WithTracing(traces => traces.AddOtlpExporter());
        }
        return builder;
    }

    public static WebApplication MapDefaultEndpoints(this WebApplication app)
    {
        app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = check => check.Tags.Contains("live") });
        app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = _ => true });
        return app;
    }
}
