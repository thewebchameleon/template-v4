namespace TemplateV4.Application;

public sealed record CultureCatalog(string DefaultCulture, IReadOnlySet<string> Supported)
{
    public static CultureCatalog Examples { get; } = new("en-ZA", new HashSet<string> { "en-ZA", "af-ZA" });
}
