using System.Text.Json;
using Xunit;

namespace TemplateV4.Ui.Tests;

public sealed class UiWorkspaceTests
{
    [Fact]
    public void Angular_workspace_keeps_its_owned_Spartan_configuration()
    {
        string repositoryRoot = FindRepositoryRoot();
        string workspace = Path.Combine(repositoryRoot, "src", "TemplateV4.Angular");

        Assert.True(File.Exists(Path.Combine(workspace, "angular.json")));
        Assert.True(File.Exists(Path.Combine(workspace, "components.json")));
        Assert.True(Directory.Exists(Path.Combine(workspace, "libs", "ui")));

        using JsonDocument manifest = JsonDocument.Parse(
            File.ReadAllText(Path.Combine(workspace, "package.json")));

        Assert.True(manifest.RootElement.GetProperty("dependencies").TryGetProperty("@spartan-ng/brain", out _));
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
