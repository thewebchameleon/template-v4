using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Modules;
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
        var invalid = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        { ["ClientModules:crm"] = "false" }).Build();
        Assert.Throws<InvalidOperationException>(() => ModuleConfiguration.Load(invalid));
        invalid["ClientModules:invoicing"] = "false";
        Assert.False(ModuleConfiguration.Load(invalid).Enabled("crm"));
        Assert.Throws<InvalidOperationException>(() => new ModuleCatalog([new("invalid", false, true, [], true, Category: "core")], new Dictionary<string, bool>()));
    }
}
