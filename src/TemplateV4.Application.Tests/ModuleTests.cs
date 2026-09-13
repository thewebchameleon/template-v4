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
    [InlineData("Modules:my-files", "yes")]
    [InlineData("Modules:my-files:Enabled", "true")]
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
            ["Modules:my-files"] = "true"
        }).Build();
        var modules = ModuleConfiguration.Load(configuration);
        Assert.True(modules.Enabled("identity"));
        Assert.True(modules.Enabled("my-files"));
        Assert.False(modules.Enabled("operations"));
        Assert.False(modules.Enabled("billing"));
        configuration["Modules:my-files"] = "false";
        Assert.True(modules.Enabled("my-files")); // Activation is a startup snapshot.
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
    public void Actor_and_tenant_flags_cannot_reenable_disabled_modules()
    {
        var actor = new BackgroundExecutionContext { ActorId = Guid.NewGuid(), TenantId = "customer" };
        var builder = WebApplication.CreateBuilder();
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ModulesPreset"] = "minimal",
            ["Features:my-files:Enabled"] = "true",
            [$"Features:my-files:Users:{actor.ActorId}"] = "true",
            ["Features:my-files:Tenants:customer"] = "true"
        });
        var flags = new ConfigurationFlags(builder.Configuration, builder.Environment, ModuleConfiguration.Load(builder.Configuration));
        Assert.False(flags.Enabled("my-files", actor));
    }
}
