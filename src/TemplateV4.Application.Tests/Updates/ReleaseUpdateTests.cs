using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Updates;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class ReleaseVersionTests
{
    [Fact]
    public void Stable_version_ordering_and_reverse_dependencies_match_release_tooling()
    {
        Assert.True(ReleaseVersions.Compare("1.10.0", "1.9.0") > 0);
        Assert.False(ReleaseVersions.Valid("01.0.0")); Assert.False(ReleaseVersions.Valid("1.0.0-beta"));
        var foundation = new ComponentRelease(1, "foundation", "0.2.0", new('a', 40), "https://example.test", "", false, [], TemplateVersion: "0.1.0", ScaffoldingVersion: "0.1.0");
        var module = new ComponentRelease(1, "reports", "1.0.0", new('b', 40), "https://example.test", "", false, [], new("0.2.0", "0.3.0"), new("@example/reports", new('c', 64), "https://example.test/reports.tgz"));
        Assert.True(ReleaseVersions.ValidRelease(module));
        var result = ReleaseVersions.Evaluate(new(1, "stable", [foundation, module]), [foundation with { Version = "0.3.0" }]);
        Assert.Equal("blocked", result[0].Status); Assert.NotEmpty(result[0].Requirements);
        Assert.False(ReleaseVersions.ValidRelease(module with { NotesUrl = "javascript:alert(1)" }));
    }
}
