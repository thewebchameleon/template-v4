using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Modules;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class ModuleTests
{
    [Theory]
    [InlineData("Modules:unknown", "true")]
    [InlineData("Modules:identity", "false")]
    [InlineData("Modules:file-storage", "yes")]
    [InlineData("Modules:file-storage:Enabled", "true")]
    [InlineData("ModulesPreset", "combined")]
    public void Invalid_deployment_configuration_fails_closed(string key, string value)
        => Assert.Throws<InvalidOperationException>(() => ModuleConfiguration.Load(
            new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { [key] = value }).Build()));

    [Fact]
    public void Explicit_deployment_settings_override_presets_but_not_required_modules()
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ModulesPreset"] = "minimal",
            ["Modules:file-storage"] = "true"
        }).Build();
        var modules = ModuleConfiguration.Load(configuration);
        Assert.True(modules.Enabled("identity"));
        Assert.True(modules.Enabled("file-storage"));
        Assert.False(modules.Enabled("audit-history"));
        Assert.False(modules.Enabled("commercial-billing"));
        configuration["Modules:file-storage"] = "false";
        Assert.True(modules.Enabled("file-storage")); // Activation is a startup snapshot.
    }

    [Fact]
    public void Graph_validation_rejects_missing_dependencies_cycles_and_disabled_prerequisites()
    {
        Assert.Throws<InvalidOperationException>(() => new ModuleCatalog([new("a", false, true, ["missing"])], new Dictionary<string, bool>()));
        Assert.Throws<InvalidOperationException>(() => new ModuleCatalog([new("a", false, false, ["b"]), new("b", false, false, ["a"])], new Dictionary<string, bool>()));
        Assert.Throws<InvalidOperationException>(() => new ModuleCatalog([new("a", false, true, ["b"]), new("b", false, false, [])], new Dictionary<string, bool>()));
        Assert.Throws<InvalidOperationException>(() => new ModuleCatalog([new("a", false, true, []), new("a", false, true, [])], new Dictionary<string, bool>()));
    }

    [Fact]
    public void Actor_flags_cannot_reenable_disabled_modules()
    {
        var actor = new BackgroundExecutionContext { ActorId = Guid.NewGuid() };
        var builder = WebApplication.CreateBuilder();
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ModulesPreset"] = "minimal",
            ["Features:file-storage:Enabled"] = "true",
            [$"Features:file-storage:Users:{actor.ActorId}"] = "true"
        });
        var flags = new ConfigurationFlags(builder.Configuration, builder.Environment);
        var catalog = ModuleConfiguration.Load(builder.Configuration);
        Assert.True(flags.Enabled("file-storage", actor)); // The provider evaluates rollout; the catalog imposes hard bounds.
        Assert.False(catalog.Evaluate(new Dictionary<string, bool> { ["file-storage"] = true }, feature => flags.Enabled(feature, actor))["file-storage"]);
    }
}
