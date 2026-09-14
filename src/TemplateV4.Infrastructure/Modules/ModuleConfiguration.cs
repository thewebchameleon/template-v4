using System.Text.Json;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Modules;

namespace TemplateV4.Infrastructure.Modules;

public static class ModuleConfiguration
{
    public static ModuleCatalog Load(IConfiguration configuration, IEnumerable<ModuleDefinition>? contributions = null)
    {
        using var stream = typeof(ModuleConfiguration).Assembly.GetManifestResourceStream("TemplateV4.Modules.catalog.json")
            ?? throw new InvalidOperationException("The module catalog is missing.");
        var definitions = JsonSerializer.Deserialize<ModuleDefinition[]>(stream, new JsonSerializerOptions(JsonSerializerDefaults.Web)
        { UnmappedMemberHandling = System.Text.Json.Serialization.JsonUnmappedMemberHandling.Disallow })
            ?? throw new InvalidOperationException("The module catalog is empty.");
        var overrides = new Dictionary<string, bool>(StringComparer.Ordinal);
        var preset = configuration["ModulesPreset"] ?? "baseline";
        if (preset is not ("baseline" or "minimal")) throw new InvalidOperationException("Unknown ModulesPreset.");
        using var presetStream = typeof(ModuleConfiguration).Assembly.GetManifestResourceStream($"TemplateV4.Modules.{preset}.json")
            ?? throw new InvalidOperationException("The module preset is missing.");
        using var presetJson = JsonDocument.Parse(presetStream);
        foreach (var item in presetJson.RootElement.GetProperty("Modules").EnumerateObject())
            overrides.Add(item.Name, item.Value.GetBoolean());
        var client = new Dictionary<string, bool>(StringComparer.Ordinal);
        foreach (var section in configuration.GetSection("ClientModules").GetChildren())
        {
            if (!definitions.Any(x => x.Id == section.Key && x.Category == "foundation") ||
                section.GetChildren().Any() || !bool.TryParse(section.Value, out var enabled))
                throw new InvalidOperationException($"ClientModules:{section.Key} must name an optional foundation module and contain a boolean.");
            client.Add(section.Key, enabled);
            overrides[section.Key] = enabled;
        }
        foreach (var section in configuration.GetSection("Modules").GetChildren())
        {
            if (section.GetChildren().Any() || !bool.TryParse(section.Value, out var enabled))
                throw new InvalidOperationException($"Modules:{section.Key} must be a boolean.");
            overrides[section.Key] = enabled;
        }
        // Environment settings may restrict a client selection, but cannot re-enable excluded features.
        foreach (var item in client.Where(x => !x.Value)) overrides[item.Key] = false;
        return new ModuleCatalog(definitions.Concat(contributions ?? []), overrides);
    }
}
