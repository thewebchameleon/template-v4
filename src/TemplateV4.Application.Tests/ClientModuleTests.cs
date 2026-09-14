using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Modules;
using TemplateV4.Infrastructure.Persistence;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class ClientModuleTests
{
    [Fact]
    public void Client_configuration_restricts_foundation_and_validates_categories_and_dependencies()
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ClientModules:support"] = "false",
            ["Modules:support"] = "true"
        }).Build();
        var catalog = ModuleConfiguration.Load(configuration);
        Assert.False(catalog.Enabled("support"));
        Assert.Equal("core", catalog.Definitions.Single(x => x.Id == "identity").Category);
        Assert.Equal("foundation", catalog.Definitions.Single(x => x.Id == "crm").Category);
        Assert.DoesNotContain(catalog.Definitions, x => x.Category == "core" && x.RuntimeConfigurable);
        configuration["ClientModules:identity"] = "false";
        Assert.Throws<InvalidOperationException>(() => ModuleConfiguration.Load(configuration));
        configuration["ClientModules:identity"] = null;
        // Use a fresh configuration because null still leaves a configuration key present.
        var invalid = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        { ["ClientModules:crm"] = "false" }).Build();
        Assert.Throws<InvalidOperationException>(() => ModuleConfiguration.Load(invalid));
        invalid["ClientModules:invoicing"] = "false";
        Assert.False(ModuleConfiguration.Load(invalid).Enabled("crm"));
        Assert.Throws<InvalidOperationException>(() => new ModuleCatalog([new("invalid", false, true, [], true, Category: "core")], new Dictionary<string, bool>()));
    }
}

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Client_excluded_modules_are_hidden_and_retained_activation_returns_after_reinstall()
    {
        await using var scope = _services.CreateAsyncScope();
        var sp = scope.ServiceProvider;
        var db = sp.GetRequiredService<FrameworkDb>();
        var before = await db.RuntimeModules.AsNoTracking().SingleAsync(x => x.Id == "support");
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        { ["ClientModules:support"] = "false" }).Build();
        var excluded = new ModuleActivationStore(db, ModuleConfiguration.Load(configuration), sp.GetRequiredService<TemplateV4.SharedKernel.IExecutionContext>(), TimeProvider.System);
        Assert.DoesNotContain(await excluded.Read(default), x => x.Id == "support");
        var retained = await db.RuntimeModules.AsNoTracking().SingleAsync(x => x.Id == "support");
        Assert.Equal(before.Version, retained.Version);
        Assert.Equal(before.Enabled, retained.Enabled);
        var restored = (await sp.GetRequiredService<IModuleActivation>().Read(default)).Single(x => x.Id == "support");
        Assert.Equal(before.Version, restored.Version);
        Assert.Equal(before.Enabled, restored.Enabled);
    }
}
