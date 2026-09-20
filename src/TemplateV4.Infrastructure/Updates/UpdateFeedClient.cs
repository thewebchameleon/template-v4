using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Platform;

namespace TemplateV4.Infrastructure.Updates;

public sealed class UpdateConfiguration
{
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    public bool Enabled { get; }
    public string? FeedUrl { get; }
    public string? Token { get; }
    public Guid? AppId { get; }
    public Guid? EnvironmentId { get; }
    public InstalledRelease Installed { get; }
    public string InstalledHash { get; }
    public UpdateConfiguration(IConfiguration configuration)
    {
        var distributionUrl = Environment.GetEnvironmentVariable("MODULE_DISTRIBUTION_URL");
        var distributionToken = Environment.GetEnvironmentVariable("MODULE_BUILD_TOKEN");
        Enabled = configuration.GetValue("Updates:Enabled", false) || distributionUrl is not null && distributionToken is not null;
        FeedUrl = configuration["Updates:FeedUrl"] ?? (distributionUrl?.TrimEnd('/') + "/api/v1/client-management");
        Token = configuration["Updates:Token"] ?? distributionToken;
        AppId = ReadGuid("MODULE_APP_ID", configuration["ModuleDistribution:AppId"]);
        EnvironmentId = ReadGuid("MODULE_ENVIRONMENT_ID", configuration["ModuleDistribution:EnvironmentId"]);
        var installedJson = configuration["Updates:InstalledJson"];
        Installed = installedJson is null ? new(1, "stable", []) : JsonSerializer.Deserialize<InstalledRelease>(installedJson, Json) ?? throw new InvalidOperationException("Invalid installed release.");
        InstalledHash = Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(Installed, Json))));
        if (Enabled && (!ReleaseVersions.Https(FeedUrl) || string.IsNullOrWhiteSpace(Token) || AppId is null || EnvironmentId is null || Installed.SchemaVersion != 1 || Installed.Channel != "stable" ||
            Installed.Components.Length > 100 || Installed.Components.Count(x => x.Id == "foundation") != 1 ||
            Installed.Components.Select(x => x.Id).Distinct().Count() != Installed.Components.Length || Installed.Components.Any(x => !ReleaseVersions.ValidRelease(x))))
            throw new InvalidOperationException("Updates requires HTTPS feed credentials and a validated pinned client release.");
    }
    private static Guid? ReadGuid(string name, string? configured)
    {
        var value = Environment.GetEnvironmentVariable(name) ?? configured;
        return string.IsNullOrWhiteSpace(value) ? null : Guid.Parse(value);
    }
}
public sealed class UpdateFeedClient(HttpClient http, UpdateConfiguration configuration)
{
    private sealed record InstalledComponent(string Id, string Version, string Digest);
    private sealed record ResolveRequest(Guid AppId, Guid EnvironmentId, ComponentRelease Foundation, InstalledComponent[] Installed);
    private sealed record ResolveResponse(InstalledRelease Release, string ManifestHash);
    public async Task<ComponentRelease[]> Fetch(CancellationToken ct)
    {
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
        timeout.CancelAfter(TimeSpan.FromSeconds(30)); ct = timeout.Token;
        var foundation = configuration.Installed.Components.Single(x => x.Id == "foundation");
        var installed = configuration.Installed.Components.Where(x => x.Id != "foundation")
            .Select(x => new InstalledComponent(x.Id, x.Version, x.Artifact?.Sha256 ?? x.Commit)).ToArray();
        using var request = new HttpRequestMessage(HttpMethod.Post, configuration.FeedUrl!.TrimEnd('/') + "/v1/resolve");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", configuration.Token);
        request.Content = JsonContent.Create(new ResolveRequest(configuration.AppId!.Value, configuration.EnvironmentId!.Value, foundation, installed));
        using var response = await http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);
        response.EnsureSuccessStatusCode();
        await using var stream = await response.Content.ReadAsStreamAsync(ct);
        using var content = new MemoryStream(); var buffer = new byte[8192];
        int length;
        while ((length = await stream.ReadAsync(buffer, ct)) != 0)
        {
            if (content.Length + length > 4 * 1024 * 1024) throw new InvalidDataException("Release feed too large.");
            content.Write(buffer, 0, length);
        }
        var result = JsonSerializer.Deserialize<ResolveResponse>(content.ToArray(), UpdateConfiguration.Json);
        var releases = result?.Release?.Components;
        if (releases is null || releases.Length > 100 || releases.Any(r => r is null || !ReleaseVersions.ValidRelease(r)) ||
            releases.Select(r => (r.Id, r.Version)).Distinct().Count() != releases.Length) throw new InvalidDataException("Invalid release feed.");
        return releases.Where(r => r.Id != "foundation").ToArray();
    }
}
