using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Updates;

public sealed class DeploymentManifestGuard(
    IServiceScopeFactory scopes,
    UpdateConfiguration configuration) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (!configuration.Installed.Components.Any(x => x.Id != "foundation")) return;
        await using var scope = scopes.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
        var recorded = await db.Set<UpdateState>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == 1, cancellationToken);
        if (recorded?.InstalledHash != configuration.InstalledHash)
            throw new InvalidOperationException("This image does not match the private-module manifest admitted by the database migrator.");
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
