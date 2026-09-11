using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.BackgroundWorker;
using TemplateV4.Infrastructure.Modules;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Disabled_modules_deny_an_authorized_actor_without_erasing_audit_data()
    {
        await using var scope = _services.CreateAsyncScope();
        var sp = scope.ServiceProvider;
        var user = await User(sp);
        var tokens = await sp.GetRequiredService<AuthService>().CreateSession(user, "module-test", true, default);
        var db = sp.GetRequiredService<FrameworkDb>();
        await db.SaveChangesAsync();
        var auditCount = await db.Audit.CountAsync();
        var configuration = new Dictionary<string, string?>(_configuration)
        {
            ["ModulesPreset"] = "minimal",
            ["Features:files:Enabled"] = "true",
            ["Features:maintenance:Enabled"] = "true"
        };
        await using var factory = new ApiFactory(configuration);
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost"), AllowAutoRedirect = false });
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/modules")).StatusCode);
        client.DefaultRequestHeaders.Authorization = new("Bearer", tokens.Access.AccessToken);
        var modules = await client.GetFromJsonAsync<Dictionary<string, bool>>("/api/v1/modules");
        Assert.True(modules!["identity"]);
        Assert.False(modules["operations"]);
        foreach (var path in new[] { "/api/v1/auth/audit", "/api/v1/auth/operations", "/api/v1/auth/operations/overview", "/api/v1/auth/files" })
            Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(path)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync("/api/v1/jobs/maintenance", new { })).StatusCode);
        Assert.True(await db.Audit.CountAsync() >= auditCount);
        Assert.Empty(await db.JobRuns.ToArrayAsync());
    }

    [Fact]
    public async Task Disabled_maintenance_does_not_enqueue_new_cron_work_or_delete_accepted_work()
    {
        await using var scope = _services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
        var accepted = new JobRun { Id = Guid.NewGuid(), AvailableAt = _clock.GetUtcNow() };
        db.JobRuns.Add(accepted);
        await db.SaveChangesAsync();
        var modules = ModuleConfiguration.Load(new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["Modules:maintenance"] = "false" }).Build());
        await new CronDispatchJob(db, _clock, modules).Execute(null!, default);
        var remaining = Assert.Single(await db.JobRuns.ToArrayAsync());
        Assert.Equal(accepted.Id, remaining.Id);
        Assert.Equal("Pending", remaining.State);
    }
}
