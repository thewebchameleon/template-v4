using Microsoft.Extensions.Diagnostics.HealthChecks;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.ApiService;

public sealed class DatabaseHealthCheck(IServiceScopeFactory scopes) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        using var scope = scopes.CreateScope();
        return await scope.ServiceProvider.GetRequiredService<FrameworkDb>().Database.CanConnectAsync(cancellationToken)
            ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy("Database unavailable.");
    }
}
