using System.Collections.Frozen;

namespace TemplateV4.Application.Modules;

public sealed record ModuleDefinition(string Id, bool Required, bool EnabledByDefault, string[] Dependencies);

/// <summary>Immutable deployment capabilities. Feature flags and permissions can restrict these further.</summary>
public sealed class ModuleCatalog
{
    private readonly FrozenSet<string> _enabled;
    public IReadOnlyList<ModuleDefinition> Definitions { get; }

    public ModuleCatalog(IEnumerable<ModuleDefinition> definitions, IReadOnlyDictionary<string, bool> overrides)
    {
        var items = definitions.ToArray();
        if (items.Length == 0) throw new InvalidOperationException("The module catalog is empty.");
        if (items.Any(x => string.IsNullOrWhiteSpace(x.Id) || x.Id.Any(c => !char.IsAsciiLetterLower(c) && !char.IsAsciiDigit(c) && c != '-')))
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
        Definitions = Array.AsReadOnly(items);
        _enabled = enabled;
    }

    public bool Enabled(string id) => _enabled.Contains(id);
}
