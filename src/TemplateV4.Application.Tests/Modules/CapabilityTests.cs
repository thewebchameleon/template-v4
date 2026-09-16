using TemplateV4.Application.Modules;
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
        Assert.False(catalog.Evaluate(runtime, _ => true, permitted: id => id != "files")["team-files"]);
        Assert.True(catalog.Evaluate(runtime, _ => true, permitted: id => id != "files")["teams"]);
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
