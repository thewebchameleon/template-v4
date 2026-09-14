using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.ApiService.Endpoints;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Modules;
using TemplateV4.Infrastructure.Persistence;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class CapabilityTests
{
    [Fact]
    public void Composed_capabilities_require_owner_prerequisites_runtime_and_flags()
    {
        var catalog = new ModuleCatalog([
            new("files", false, true, [], true, "files"),
            new("teams", false, true, [], Capabilities: [new("team-files", ["files"])])], new Dictionary<string, bool>());
        Assert.False(catalog.Evaluate(new Dictionary<string, bool>(), _ => true)["files"]);
        var runtime = new Dictionary<string, bool> { ["files"] = true };
        Assert.True(catalog.Evaluate(runtime, _ => true)["team-files"]);
        Assert.False(catalog.Evaluate(runtime, _ => false)["team-files"]);
        Assert.True(catalog.Evaluate(runtime, _ => false)["teams"]);
        runtime["files"] = false;
        Assert.False(catalog.Evaluate(runtime, _ => true)["team-files"]);
        Assert.False(catalog.EffectiveModule("unknown", runtime));
    }

    [Fact]
    public void Runtime_transitions_block_transitive_dependents_and_missing_prerequisites()
    {
        var catalog = new ModuleCatalog([new("a", false, true, [], true), new("b", false, true, ["a"], true), new("c", false, true, ["b"], true)], new Dictionary<string, bool>());
        var runtime = new Dictionary<string, bool> { ["a"] = true, ["b"] = true, ["c"] = true };
        Assert.Equal(new[] { "b", "c" }, catalog.TransitionBlockers("a", false, runtime));
        runtime["a"] = false;
        Assert.False(catalog.EffectiveModule("c", runtime));
        Assert.Equal(new[] { "a" }, catalog.TransitionBlockers("b", true, runtime));
    }

    [Fact]
    public void Invalid_capability_graphs_and_required_runtime_switches_are_rejected()
    {
        Assert.Throws<InvalidOperationException>(() => new ModuleCatalog([new("a", true, true, [], true)], new Dictionary<string, bool>()));
        Assert.Throws<InvalidOperationException>(() => new ModuleCatalog([new("a", false, true, [], Capabilities: [new("b", ["missing"])])], new Dictionary<string, bool>()));
        Assert.Throws<InvalidOperationException>(() => new ModuleCatalog([new("a", false, true, [], Capabilities: [new("b", ["c"]), new("c", ["b"])])], new Dictionary<string, bool>()));
        Assert.Throws<InvalidOperationException>(() => new ModuleCatalog([new("a", false, true, [], Capabilities: [new("a", [])])], new Dictionary<string, bool>()));
    }
}

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Discovered_business_module_is_available_without_configuration_but_requires_runtime_activation()
    {
        await using var factory = new ApiFactory(_configuration);
        using var client = factory.CreateClient();
        var foundation = factory.Services.GetRequiredService<ModuleCatalog>();
        var catalog = new ModuleCatalog(foundation.Definitions.Append(new("sample-business", false, true, ["crm"], true)), new Dictionary<string, bool>());
        Assert.True(catalog.Enabled("sample-business"));
        Assert.False(catalog.EffectiveModule("sample-business", new Dictionary<string, bool>()));
        var activation = catalog.Definitions.Where(x => x.RuntimeConfigurable).ToDictionary(x => x.Id, _ => true);
        Assert.True(catalog.EffectiveModule("sample-business", activation));
        activation["crm"] = false;
        Assert.False(catalog.EffectiveModule("sample-business", activation));
    }

    [Fact]
    public async Task Capability_metadata_covers_module_routes_and_lifecycle_exceptions()
    {
        await using var factory = new ApiFactory(_configuration);
        using var client = factory.CreateClient();
        var endpoints = factory.Services.GetRequiredService<EndpointDataSource>().Endpoints.OfType<RouteEndpoint>().ToArray();
        var catalog = factory.Services.GetRequiredService<ModuleCatalog>();
        var owned = endpoints.Where(endpoint => endpoint.Metadata.GetMetadata<ModuleOwnership>() != null).ToArray();
        Assert.NotEmpty(owned);
        foreach (var endpoint in owned)
        {
            var gates = endpoint.Metadata.GetOrderedMetadata<CapabilityRequirement>();
            var exception = endpoint.Metadata.GetMetadata<ModuleLifecycleException>();
            Assert.True(gates.Count > 0 || !string.IsNullOrWhiteSpace(exception?.Reason), endpoint.DisplayName);
            Assert.False(gates.Count > 0 && exception != null, endpoint.DisplayName);
            foreach (var gate in gates) Assert.True(catalog.Capabilities.ContainsKey(gate.Id), endpoint.DisplayName);
        }
        // Independently enforce ownership for module URL boundaries so omission of all metadata is caught.
        foreach (var endpoint in endpoints.Where(x => new[] { "/api/v1/auth/my-files", "/api/v1/auth/support", "/api/v1/auth/customers", "/api/v1/auth/organisations", "/api/v1/auth/operations", "/api/v1/auth/audit", "/api/v1/billing/callbacks" }
            .Any(prefix => x.RoutePattern.RawText?.StartsWith(prefix, StringComparison.Ordinal) == true)))
            Assert.NotNull(endpoint.Metadata.GetMetadata<ModuleOwnership>());
    }

    [Fact]
    public async Task Capability_runtime_dependency_changes_serialize_across_database_scopes()
    {
        await using var setup = _services.CreateAsyncScope();
        var user = await User(setup.ServiceProvider);
        var db = setup.ServiceProvider.GetRequiredService<FrameworkDb>();
        await db.RuntimeModules.Where(x => x.Id == "support").ExecuteUpdateAsync(x => x.SetProperty(s => s.Enabled, false));
        var rows = await db.RuntimeModules.AsNoTracking().ToDictionaryAsync(x => x.Id);
        // Synthetic relationship exercises the production store without adding production switches.
        var catalog = new ModuleCatalog([new("my-files", false, true, [], true), new("support", false, true, ["my-files"], true)], new Dictionary<string, bool>());
        async Task<bool> Change(string id, bool enabled)
        {
            await using var scope = _services.CreateAsyncScope();
            var scopedDb = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
            var context = scope.ServiceProvider.GetRequiredService<BackgroundExecutionContext>(); context.ActorId = user.Id;
            await using var transaction = await scopedDb.Database.BeginTransactionAsync();
            var store = new ModuleActivationStore(scopedDb, catalog, context, _clock);
            var result = await store.Save(new(id, enabled, rows[id].Version), default);
            if (result.IsSuccess) { await scopedDb.SaveChangesAsync(); await transaction.CommitAsync(); }
            else { Assert.Equal("modules.dependencies", result.Error!.Code); await transaction.RollbackAsync(); }
            return result.IsSuccess;
        }
        var results = await Task.WhenAll(Change("my-files", false), Change("support", true));
        Assert.Single(results, x => x);
        var runtime = await db.RuntimeModules.AsNoTracking().ToDictionaryAsync(x => x.Id, x => x.Enabled);
        Assert.True(!runtime["support"] || runtime["my-files"]);
        Assert.Single(await db.Audit.Where(x => x.Action == "module.my-files_disabled" || x.Action == "module.support_enabled").ToArrayAsync());
    }

    [Fact]
    public async Task Capability_typed_settings_keep_activation_versions_independent()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var actor = await User(sp); var context = sp.GetRequiredService<BackgroundExecutionContext>();
        context.ActorId = actor.Id; context.Permissions = new HashSet<string> { "settings.manage" };
        var activation = sp.GetRequiredService<IModuleActivation>();
        var original = (await activation.Read(default)).Single(x => x.Id == ModuleIds.MyFiles);
        var files = await sp.GetRequiredService<IMyFilesModuleSettings>().Read(default);
        var saved = await sp.GetRequiredService<Dispatcher<SaveMyFilesModuleSettings, MyFilesModuleSettings>>()
            .Send(new(files.DemoMode, true, files.Version));
        Assert.True(saved.IsSuccess);
        Assert.True((await activation.Read(default)).Single(x => x.Id == ModuleIds.MyFiles).Enabled);
        Assert.Equal(original.Version, (await activation.Read(default)).Single(x => x.Id == ModuleIds.MyFiles).Version);
        var stale = await sp.GetRequiredService<Dispatcher<SaveMyFilesModuleSettings, MyFilesModuleSettings>>().Send(new(false, false, files.Version));
        Assert.Equal("modules.conflict", stale.Error!.Code);

        var dispatcher = sp.GetRequiredService<Dispatcher<SaveMyFilesModuleSettings, MyFilesModuleSettings>>();
        var demo = await dispatcher.Send(new(true, true, saved.Value!.Version, "Test-only!Password942"));
        Assert.True(demo.IsSuccess);
        var db = sp.GetRequiredService<FrameworkDb>();
        var started = (await db.FileStorageSettings.AsNoTracking().SingleAsync()).DemoStartedAt;
        Assert.NotNull(started);
        Assert.Equal(_clock.GetUtcNow().UtcTicks / 10, started.Value.UtcTicks / 10); // PostgreSQL stores microseconds.
        var slow = await dispatcher.Send(new(true, false, demo.Value!.Version));
        Assert.True(slow.IsSuccess);
        Assert.Equal(started, (await db.FileStorageSettings.AsNoTracking().SingleAsync()).DemoStartedAt);
        var ended = await dispatcher.Send(new(false, false, slow.Value!.Version));
        Assert.True(ended.IsSuccess);
        Assert.Null((await db.FileStorageSettings.AsNoTracking().SingleAsync()).DemoStartedAt);
        Assert.Equal(2, await db.Audit.CountAsync(x => x.Action == "module.my-files_demo_changed"));
    }
}
