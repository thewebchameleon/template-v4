using System.Text.Json;
using System.Text.RegularExpressions;
using Xunit;

namespace TemplateV4.Utility.Tests;

public sealed class FrameworkManifestTests
{
    [Fact]
    public void Every_declared_project_path_exists()
    {
        string repositoryRoot = FindRepositoryRoot();
        string manifestPath = Path.Combine(repositoryRoot, "framework.json");
        using JsonDocument manifest = JsonDocument.Parse(File.ReadAllText(manifestPath));

        foreach (JsonProperty project in manifest.RootElement.GetProperty("projects").EnumerateObject())
        {
            string declaredPath = project.Value.GetString()!;
            string absolutePath = Path.Combine(repositoryRoot, declaredPath);

            if (project.NameEquals("CLI"))
            {
                Assert.True(File.Exists(absolutePath));
                continue;
            }

            Assert.True(
                Directory.Exists(absolutePath),
                $"The '{project.Name}' project path does not exist.");
        }
    }

    [Fact]
    public void Api_route_handlers_are_registered_in_endpoint_files()
    {
        string repositoryRoot = FindRepositoryRoot();
        string apiRoot = Path.Combine(repositoryRoot, "src", "TemplateV4.ApiService");
        Regex routeDeclaration = new(@"\.(MapGet|MapPost|MapPut|MapDelete|MapPatch)\s*\(", RegexOptions.CultureInvariant);

        string[] routeFiles = Directory.GetFiles(apiRoot, "*.cs", SearchOption.AllDirectories)
            .Where(file => !file.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}", StringComparison.Ordinal)
                && !file.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.Ordinal)
                && routeDeclaration.IsMatch(File.ReadAllText(file)))
            .ToArray();

        Assert.NotEmpty(routeFiles);
        Assert.All(routeFiles, file =>
        {
            Assert.StartsWith(Path.Combine(apiRoot, "Endpoints") + Path.DirectorySeparatorChar, file, StringComparison.Ordinal);
            Assert.EndsWith("Endpoints.cs", file, StringComparison.Ordinal);
        });
    }

    private static string FindRepositoryRoot()
    {
        DirectoryInfo? directory = new(AppContext.BaseDirectory);

        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "framework.json")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName
            ?? throw new DirectoryNotFoundException("Could not locate the repository root.");
    }
}
