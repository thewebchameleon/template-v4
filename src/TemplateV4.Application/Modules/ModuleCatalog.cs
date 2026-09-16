using System.Collections.Frozen;
using System.Text.Json.Serialization;

namespace TemplateV4.Application.Modules;

public sealed record ModuleDefinition([property: JsonRequired] string Id, [property: JsonRequired] bool Required,
    [property: JsonRequired] bool EnabledByDefault, [property: JsonRequired] IReadOnlyList<string> Dependencies,
    bool RuntimeConfigurable = false, string? FeatureFlag = null, IReadOnlyList<CapabilityDefinition>? Capabilities = null,
    string Category = "foundation", bool LicenseRequired = false);
public sealed record CapabilityDefinition([property: JsonRequired] string Id, [property: JsonRequired] IReadOnlyList<string> Requires, string? FeatureFlag = null);

/// <summary>Immutable deployment capabilities. Feature flags and permissions can restrict these further.</summary>
public sealed class ModuleCatalog
{
    private readonly FrozenSet<string> _enabled;
    public IReadOnlyList<ModuleDefinition> Definitions { get; }
    public IReadOnlyDictionary<string, CapabilityDefinition> Capabilities { get; }
    public IReadOnlyDictionary<string, string> CapabilityOwners { get; }

    public ModuleCatalog(IEnumerable<ModuleDefinition> definitions, IReadOnlyDictionary<string, bool> overrides)
    {
        var items = definitions.ToArray();
        if (items.Any(x => x is null || x.Category is not ("core" or "foundation" or "private") ||
            (x.Category == "core" && x.RuntimeConfigurable) || (x.Category == "private" && x.Required)))
            throw new InvalidOperationException("Invalid module category or lifecycle.");
        if (items.Length == 0) throw new InvalidOperationException("The module catalog is empty.");
        if (items.Any(x => x is null || x.Dependencies is null || x.Dependencies.Any(string.IsNullOrWhiteSpace) ||
            x.Capabilities?.Any(c => c is null || c.Requires is null || c.Requires.Any(string.IsNullOrWhiteSpace)) == true))
            throw new InvalidOperationException("Invalid module descriptor.");
        items = items.Select(x => x with
        {
            Dependencies = Array.AsReadOnly(x.Dependencies.ToArray()),
            Capabilities = Array.AsReadOnly((x.Capabilities ?? []).Select(c => c with { Requires = Array.AsReadOnly(c.Requires.ToArray()) }).ToArray())
        }).ToArray();
        if (items.Any(x => string.IsNullOrWhiteSpace(x.Id) || !ValidId(x.Id)))
            throw new InvalidOperationException("Module identifiers must use lowercase letters, digits and hyphens.");
        if (items.Select(x => x.Id).Distinct(StringComparer.Ordinal).Count() != items.Length)
            throw new InvalidOperationException("Duplicate module identifier.");
        var known = items.ToDictionary(x => x.Id, StringComparer.Ordinal);
        foreach (var key in overrides.Keys)
            if (!known.ContainsKey(key)) throw new InvalidOperationException($"Unknown module: {key}.");
        var visited = new HashSet<string>(StringComparer.Ordinal);
        var visiting = new HashSet<string>(StringComparer.Ordinal);
        void Visit(string id)
        {
            if (visited.Contains(id)) return;
            if (!visiting.Add(id)) throw new InvalidOperationException($"Module dependency cycle at {id}.");
            foreach (var dependency in known[id].Dependencies)
            {
                if (!known.ContainsKey(dependency)) throw new InvalidOperationException($"Unknown dependency {dependency} for {id}.");
                Visit(dependency);
            }
            visiting.Remove(id);
            visited.Add(id);
        }
        foreach (var item in items) Visit(item.Id);
        var enabled = items.Where(x => overrides.TryGetValue(x.Id, out var value) ? value : x.EnabledByDefault)
            .Select(x => x.Id).ToFrozenSet(StringComparer.Ordinal);
        foreach (var item in items)
        {
            if (item.Required && !enabled.Contains(item.Id)) throw new InvalidOperationException($"Required module {item.Id} cannot be disabled.");
            if (enabled.Contains(item.Id))
                foreach (var dependency in item.Dependencies)
                    if (!enabled.Contains(dependency)) throw new InvalidOperationException($"Module {item.Id} requires {dependency}.");
        }
        var capabilities = new Dictionary<string, CapabilityDefinition>(StringComparer.Ordinal);
        var owners = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var item in items)
        {
            if (item.Required && item.RuntimeConfigurable) throw new InvalidOperationException("Required modules cannot be runtime configurable.");
            AddCapability(new(item.Id, item.Dependencies, item.FeatureFlag), item.Id);
            foreach (var capability in item.Capabilities ?? [])
                AddCapability(capability with { Requires = [item.Id, .. capability.Requires] }, item.Id);
        }
        void AddCapability(CapabilityDefinition capability, string owner)
        {
            if (capability.FeatureFlag is not null && (string.IsNullOrWhiteSpace(capability.FeatureFlag) || !ValidId(capability.FeatureFlag)))
                throw new InvalidOperationException("Invalid feature flag identifier.");
            if (string.IsNullOrWhiteSpace(capability.Id) || !ValidId(capability.Id) || !capabilities.TryAdd(capability.Id, capability))
                throw new InvalidOperationException($"Invalid or duplicate capability {capability.Id}.");
            capabilities[capability.Id] = capability with { Requires = Array.AsReadOnly(capability.Requires.ToArray()) };
            owners.Add(capability.Id, owner);
        }
        visited.Clear(); visiting.Clear();
        void VisitCapability(string id)
        {
            if (visited.Contains(id)) return;
            if (!capabilities.ContainsKey(id)) throw new InvalidOperationException($"Unknown capability {id}.");
            if (!visiting.Add(id)) throw new InvalidOperationException($"Capability dependency cycle at {id}.");
            foreach (var dependency in capabilities[id].Requires) VisitCapability(dependency);
            visiting.Remove(id); visited.Add(id);
        }
        foreach (var id in capabilities.Keys) VisitCapability(id);
        Capabilities = capabilities.ToFrozenDictionary(StringComparer.Ordinal);
        CapabilityOwners = owners.ToFrozenDictionary(StringComparer.Ordinal);
        Definitions = Array.AsReadOnly(items);
        _enabled = enabled;
    }

    private static bool ValidId(string id) => System.Text.RegularExpressions.Regex.IsMatch(id, "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$");

    public bool Enabled(string id) => _enabled.Contains(id);

    public bool RuntimeConfigurable(string id) => Definitions.Any(x => x.Id == id && x.RuntimeConfigurable);

    public bool EffectiveModule(string id, IReadOnlyDictionary<string, bool> runtime)
    {
        var definition = Definitions.FirstOrDefault(x => x.Id == id);
        return definition is not null && Enabled(id) &&
            (!definition.RuntimeConfigurable || runtime.GetValueOrDefault(id)) &&
            definition.Dependencies.All(x => EffectiveModule(x, runtime));
    }

    public Dictionary<string, bool> Evaluate(IReadOnlyDictionary<string, bool> runtime, Func<string, bool> flag,
        Func<string, bool>? licensed = null)
    {
        var result = new Dictionary<string, bool>(StringComparer.Ordinal);
        bool EvaluateOne(string id)
        {
            if (result.TryGetValue(id, out var value)) return value;
            var definition = Capabilities[id];
            return result[id] = EffectiveModule(CapabilityOwners[id], runtime) && (licensed?.Invoke(CapabilityOwners[id]) ?? true) &&
                (definition.FeatureFlag is null || flag(definition.FeatureFlag)) && definition.Requires.All(EvaluateOne);
        }
        foreach (var id in Capabilities.Keys) EvaluateOne(id);
        return result;
    }

    // Return the prerequisite modules that would be unavailable after a requested transition.
    public string[] TransitionBlockers(string id, bool enabled, IReadOnlyDictionary<string, bool> runtime)
    {
        var candidate = runtime.ToDictionary(x => x.Key, x => x.Value, StringComparer.Ordinal);
        candidate[id] = enabled;
        if (enabled)
            return Definitions.Single(x => x.Id == id).Dependencies.Where(x => !EffectiveModule(x, candidate)).Order().ToArray();
        return Definitions.Where(x => x.Id != id && EffectiveModule(x.Id, runtime) && !EffectiveModule(x.Id, candidate))
            .Select(x => x.Id).Order().ToArray();
    }
}
