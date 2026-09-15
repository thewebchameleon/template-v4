using System.Net.Http.Headers;
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
    public InstalledRelease Installed { get; }
    public string InstalledHash { get; }
    public UpdateConfiguration(IConfiguration configuration)
    {
        Enabled = configuration.GetValue("Updates:Enabled", false);
        FeedUrl = configuration["Updates:FeedUrl"];
        Token = configuration["Updates:Token"];
        var installedJson = configuration["Updates:InstalledJson"];
        Installed = installedJson is null ? new(1, "stable", []) : JsonSerializer.Deserialize<InstalledRelease>(installedJson, Json) ?? throw new InvalidOperationException("Invalid installed release.");
        InstalledHash = Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(Installed, Json))));
        if (Enabled && (!ReleaseVersions.Https(FeedUrl) || string.IsNullOrWhiteSpace(Token) || Installed.SchemaVersion != 1 || Installed.Channel != "stable" ||
            Installed.Components.Length > 100 || Installed.Components.Count(x => x.Id == "foundation") != 1 ||
            Installed.Components.Select(x => x.Id).Distinct().Count() != Installed.Components.Length || Installed.Components.Any(x => !ReleaseVersions.ValidRelease(x))))
            throw new InvalidOperationException("Updates requires HTTPS feed credentials and a validated pinned client release.");
    }
}
public sealed class UpdateFeedClient(HttpClient http, UpdateConfiguration configuration)
{
    public async Task<ComponentRelease[]> Fetch(CancellationToken ct)
    {
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
        timeout.CancelAfter(TimeSpan.FromSeconds(30)); ct = timeout.Token;
        using var request = new HttpRequestMessage(HttpMethod.Get, configuration.FeedUrl!.TrimEnd('/') + "/v1/releases");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", configuration.Token);
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
        var feed = JsonSerializer.Deserialize<ReleaseFeed>(content.ToArray(), UpdateConfiguration.Json);
        if (feed is null || feed.SchemaVersion != 1 || feed.Releases is null || feed.Releases.Length > 1000 || feed.Releases.Any(r => r is null || !ReleaseVersions.ValidRelease(r)) ||
            feed.Releases.Select(r => (r.Id, r.Version)).Distinct().Count() != feed.Releases.Length) throw new InvalidDataException("Invalid release feed.");
        return feed.Releases.Where(r => configuration.Installed.Components.Any(c => c.Id == r.Id)).ToArray();
    }
}
