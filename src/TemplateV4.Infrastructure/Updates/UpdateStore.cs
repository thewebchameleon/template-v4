using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Updates;

public sealed class UpdateState
{
    public int Id { get; set; } = 1;
    public DateTimeOffset? CheckedAt { get; set; }
    public DateTimeOffset? SucceededAt { get; set; }
    public string Status { get; set; } = "pending";
    public string InstalledHash { get; set; } = "";
    public string ReleasesJson { get; set; } = "[]";
}
public sealed class UpdateAnnouncement
{
    public string Component { get; set; } = "";
    public string Version { get; set; } = "";
}
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
public sealed class UpdateStore(FrameworkDb db, UpdateConfiguration configuration, TimeProvider time) : IUpdates
{
    public async Task<UpdateSummary> Read(CancellationToken ct)
    {
        if (!configuration.Enabled) return new(false, null, null, "disabled", ReleaseVersions.Evaluate(configuration.Installed, []));
        var state = await db.Set<UpdateState>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == 1, ct);
        var matching = state?.InstalledHash == configuration.InstalledHash;
        var releases = matching ? JsonSerializer.Deserialize<ComponentRelease[]>(state!.ReleasesJson, UpdateConfiguration.Json)! : [];
        var status = !matching ? "pending" : state!.Status == "ok" && state.SucceededAt < time.GetUtcNow().AddHours(-48) ? "stale" : state.Status;
        return new(true, state?.CheckedAt, matching ? state?.SucceededAt : null, status, ReleaseVersions.Evaluate(configuration.Installed, releases));
    }
    public async Task<bool> Due(CancellationToken ct) => configuration.Enabled && !await db.Set<UpdateState>().AnyAsync(x => x.Id == 1 && x.InstalledHash == configuration.InstalledHash && x.CheckedAt > time.GetUtcNow().AddHours(-6), ct);
    public async Task Record(ComponentRelease[]? releases, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(7821403901)", ct);
        var state = await db.Set<UpdateState>().SingleOrDefaultAsync(x => x.Id == 1, ct);
        if (state is not null && state.InstalledHash == configuration.InstalledHash && state.CheckedAt > time.GetUtcNow().AddMinutes(-1)) return;
        if (state is null) { state = new(); db.Add(state); }
        if (state.InstalledHash != configuration.InstalledHash) { state.ReleasesJson = "[]"; state.SucceededAt = null; }
        state.InstalledHash = configuration.InstalledHash;
        state.CheckedAt = time.GetUtcNow(); state.Status = releases is null ? "unavailable" : "ok";
        if (releases is not null)
        {
            state.SucceededAt = state.CheckedAt;
            state.ReleasesJson = JsonSerializer.Serialize(releases, UpdateConfiguration.Json);
            var admins = await (from user in db.Users join membership in db.UserRoles on user.Id equals membership.UserId join role in db.Roles on membership.RoleId equals role.Id where role.Name == "Administrator" select user.Id).Distinct().ToArrayAsync(ct);
            foreach (var update in ReleaseVersions.Evaluate(configuration.Installed, releases).Where(x => x.AvailableVersion is not null))
            {
                if (admins.Length == 0 || await db.Set<UpdateAnnouncement>().AnyAsync(x => x.Component == update.Id && x.Version == update.AvailableVersion, ct)) continue;
                db.Add(new UpdateAnnouncement { Component = update.Id, Version = update.AvailableVersion! });
                foreach (var admin in admins) db.Notifications.Add(new() { UserId = admin, Kind = "notificationReleaseAvailable", Link = "/administration/updates", CreatedAt = time.GetUtcNow() });
            }
        }
        await db.SaveChangesAsync(ct); await transaction.CommitAsync(ct);
    }
}
