using System.Globalization;
using System.Text.RegularExpressions;

namespace TemplateV4.Application.Platform;

public sealed record ReleaseRange(string Min, string MaxExclusive);
public sealed record ReleaseArtifact(string Package, string Sha256, string DownloadUrl);
public sealed record ComponentRelease(int SchemaVersion, string Id, string Version, string Commit, string NotesUrl,
    string MigrationNotes, bool Breaking, Dictionary<string, ReleaseRange> Dependencies,
    ReleaseRange? Foundation = null, ReleaseArtifact? Artifact = null, string? TemplateVersion = null, string? ScaffoldingVersion = null);
public sealed record ReleaseFeed(int SchemaVersion, ComponentRelease[] Releases);
public sealed record InstalledRelease(int SchemaVersion, string Channel, ComponentRelease[] Components);
public sealed record ComponentUpdate(string Id, string InstalledVersion, string? AvailableVersion, string Status,
    string? NotesUrl, string? MigrationNotes, bool Breaking, string[] Requirements);
public sealed record UpdateSummary(bool Enabled, DateTimeOffset? CheckedAt, DateTimeOffset? SucceededAt, string Status, ComponentUpdate[] Components);
public interface IUpdates
{
    Task<UpdateSummary> Read(CancellationToken ct);
}

public static partial class ReleaseVersions
{
    [GeneratedRegex(@"^(0|[1-9][0-9]{0,8})\.(0|[1-9][0-9]{0,8})\.(0|[1-9][0-9]{0,8})$")]
    private static partial Regex Pattern();
    public static bool Valid(string? value) => value is not null && Pattern().IsMatch(value);
    public static int Compare(string first, string second)
    {
        if (!Valid(first) || !Valid(second)) throw new ArgumentException("Expected stable semantic versions.");
        var a = first.Split('.').Select(x => int.Parse(x, CultureInfo.InvariantCulture)).ToArray();
        var b = second.Split('.').Select(x => int.Parse(x, CultureInfo.InvariantCulture)).ToArray();
        for (var i = 0; i < 3; i++) if (a[i] != b[i]) return a[i].CompareTo(b[i]);
        return 0;
    }
    public static bool ValidRange(ReleaseRange? range) => range is not null && Valid(range.Min) && Valid(range.MaxExclusive) && Compare(range.Min, range.MaxExclusive) < 0;
    public static bool Satisfies(string? version, ReleaseRange? range) => Valid(version) && ValidRange(range) && Compare(version!, range!.Min) >= 0 && Compare(version!, range.MaxExclusive) < 0;
    public static bool Https(string? value) => Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == "https" && uri.UserInfo.Length == 0 && uri.Fragment.Length == 0;
    public static bool ValidRelease(ComponentRelease release) => release.SchemaVersion == 1 &&
        Regex.IsMatch(release.Id ?? "", "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$", RegexOptions.CultureInvariant) && release.Id!.Length <= 80 &&
        Valid(release.Version) && Regex.IsMatch(release.Commit ?? "", "^[a-f0-9]{40}$", RegexOptions.CultureInvariant) &&
        Https(release.NotesUrl) && release.NotesUrl.Length <= 1500 && release.MigrationNotes is { Length: <= 8000 } &&
        release.Dependencies is not null && release.Dependencies.All(x => x.Key != "foundation" && x.Key != release.Id && Regex.IsMatch(x.Key, "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$", RegexOptions.CultureInvariant) && ValidRange(x.Value)) &&
        (release.Id == "foundation" ? release.Dependencies.Count == 0 && Valid(release.TemplateVersion) && Valid(release.ScaffoldingVersion) :
            ValidRange(release.Foundation) && release.Artifact is not null && Regex.IsMatch(release.Artifact.Package ?? "", "^@[a-z0-9-]+/[a-z0-9-]+$", RegexOptions.CultureInvariant) &&
            Regex.IsMatch(release.Artifact.Sha256 ?? "", "^[a-f0-9]{64}$", RegexOptions.CultureInvariant) && Https(release.Artifact.DownloadUrl));

    public static ComponentUpdate[] Evaluate(InstalledRelease installed, ComponentRelease[] releases)
    {
        var proposals = installed.Components.Select(c => releases.Where(r => r.Id == c.Id && Valid(c.Version) && Compare(r.Version, c.Version) > 0)
            .OrderByDescending(r => r.Version, Comparer<string>.Create(Compare)).FirstOrDefault() ?? c).ToArray();
        var requirements = proposals.SelectMany(c => (c.Dependencies ?? []).Concat(c.Id == "foundation" ? [] : new Dictionary<string, ReleaseRange> { ["foundation"] = c.Foundation! })
            .Where(d => !Satisfies(proposals.FirstOrDefault(p => p.Id == d.Key)?.Version, d.Value))
            .Select(d => $"{c.Id}: {d.Key} >= {d.Value?.Min ?? "?"} < {d.Value?.MaxExclusive ?? "?"}")).Distinct().ToArray();
        return installed.Components.Select(c =>
        {
            var next = proposals.Single(p => p.Id == c.Id);
            var changed = next.Version != c.Version;
            return new ComponentUpdate(c.Id, c.Version, changed ? next.Version : null,
                !Valid(c.Version) ? "unreleased" : changed ? requirements.Length == 0 ? "available" : "blocked" : "current",
                changed ? next.NotesUrl : null, changed ? next.MigrationNotes : null, changed && next.Breaking, changed ? requirements : []);
        }).ToArray();
    }
}
