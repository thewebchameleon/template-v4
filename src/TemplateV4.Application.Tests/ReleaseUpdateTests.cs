using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using TemplateV4.Infrastructure.Updates;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    private static ComponentRelease FoundationRelease(string version = "0.2.0") => new(1, "foundation", version, new('a', 40), "https://example.test/releases", "Run migrator.", false, [], TemplateVersion: "0.1.0", ScaffoldingVersion: "0.1.0");
    private static ComponentRelease ReportsRelease(string version = "1.0.0") => new(1, "reports", version, new('b', 40), "https://example.test/reports", "Run module migrations.", false, [], new("0.2.0", "0.3.0"), new("@example/reports", new('c', 64)));
    private static UpdateConfiguration UpdateConfig(params ComponentRelease[] components) => new(new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
    {
        ["Updates:Enabled"] = "true",
        ["Updates:FeedUrl"] = "https://updates.example.test",
        ["Updates:Token"] = "test-only-feed-credential",
        ["Updates:InstalledJson"] = JsonSerializer.Serialize(new InstalledRelease(1, "stable", components), UpdateConfiguration.Json)
    }).Build());

    [Fact]
    public async Task Release_updates_are_atomic_deduplicated_and_only_notify_administrators()
    {
        var config = UpdateConfig(FoundationRelease(), ReportsRelease()); Guid adminId; Guid readerId;
        await using (var scope = _services.CreateAsyncScope())
        {
            adminId = (await User(scope.ServiceProvider)).Id;
            var reader = await User(scope.ServiceProvider); readerId = reader.Id;
            await scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>().RemoveFromRoleAsync(reader, "Administrator");
        }
        async Task Record()
        {
            await using var scope = _services.CreateAsyncScope();
            await new UpdateStore(scope.ServiceProvider.GetRequiredService<FrameworkDb>(), config, _clock).Record([ReportsRelease("1.1.0")], default);
        }
        await Task.WhenAll(Record(), Record(), Record());
        await using var check = _services.CreateAsyncScope(); var db = check.ServiceProvider.GetRequiredService<FrameworkDb>();
        Assert.Single(await db.Set<UpdateAnnouncement>().ToArrayAsync());
        Assert.Equal(adminId, (await db.Notifications.SingleAsync(x => x.Kind == "notificationReleaseAvailable")).UserId);
        Assert.False(await db.Notifications.AnyAsync(x => x.UserId == readerId));
        var store = new UpdateStore(db, config, _clock);
        var summary = await store.Read(default);
        Assert.Equal("available", summary.Components.Single(x => x.Id == "reports").Status);
        Assert.False(await store.Due(default));
        // A retry after notification retention must not reannounce the same release.
        await db.Notifications.ExecuteDeleteAsync();
        await db.Set<UpdateState>().ExecuteUpdateAsync(x => x.SetProperty(s => s.CheckedAt, _clock.GetUtcNow().AddDays(-1)));
        db.ChangeTracker.Clear(); await store.Record([ReportsRelease("1.1.0")], default);
        Assert.False(await db.Notifications.AnyAsync());
        await db.Set<UpdateState>().ExecuteUpdateAsync(x => x.SetProperty(s => s.CheckedAt, _clock.GetUtcNow().AddDays(-1)));
        db.ChangeTracker.Clear(); await store.Record(null, default);
        Assert.Equal("unavailable", (await store.Read(default)).Status);
        Assert.Equal("1.1.0", (await store.Read(default)).Components.Single(x => x.Id == "reports").AvailableVersion);
        var changedDeployment = new UpdateStore(db, UpdateConfig(FoundationRelease(), ReportsRelease("1.1.0")), _clock);
        Assert.Equal("pending", (await changedDeployment.Read(default)).Status);
        Assert.All((await changedDeployment.Read(default)).Components, c => Assert.Null(c.AvailableVersion));
    }

    [Fact]
    public async Task Release_updates_endpoint_rejects_nonadministrators()
    {
        await using var factory = new ApiFactory(_configuration);
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost") });
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/auth/updates")).StatusCode);
        await using var scope = _services.CreateAsyncScope(); var user = await User(scope.ServiceProvider);
        var auth = scope.ServiceProvider.GetRequiredService<AuthService>();
        var session = await auth.CreateSession(user, "update-admin", true, default);
        await scope.ServiceProvider.GetRequiredService<FrameworkDb>().SaveChangesAsync();
        client.DefaultRequestHeaders.Authorization = new("Bearer", session.Access.AccessToken);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/auth/updates")).StatusCode);
        await scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>().RemoveFromRoleAsync(user, "Administrator");
        session = await auth.CreateSession(user, "update-reader", true, default);
        await scope.ServiceProvider.GetRequiredService<FrameworkDb>().SaveChangesAsync();
        client.DefaultRequestHeaders.Authorization = new("Bearer", session.Access.AccessToken);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/v1/auth/updates")).StatusCode);
    }
}

public sealed class ReleaseVersionTests
{
    [Fact]
    public void Stable_version_ordering_and_reverse_dependencies_match_release_tooling()
    {
        Assert.True(ReleaseVersions.Compare("1.10.0", "1.9.0") > 0);
        Assert.False(ReleaseVersions.Valid("01.0.0")); Assert.False(ReleaseVersions.Valid("1.0.0-beta"));
        var foundation = new ComponentRelease(1, "foundation", "0.2.0", new('a', 40), "https://example.test", "", false, [], TemplateVersion: "0.1.0", ScaffoldingVersion: "0.1.0");
        var module = new ComponentRelease(1, "reports", "1.0.0", new('b', 40), "https://example.test", "", false, [], new("0.2.0", "0.3.0"), new("@example/reports", new('c', 64)));
        Assert.True(ReleaseVersions.ValidRelease(module));
        var result = ReleaseVersions.Evaluate(new(1, "stable", [foundation, module]), [foundation with { Version = "0.3.0" }]);
        Assert.Equal("blocked", result[0].Status); Assert.NotEmpty(result[0].Requirements);
        Assert.False(ReleaseVersions.ValidRelease(module with { NotesUrl = "javascript:alert(1)" }));
    }
}
