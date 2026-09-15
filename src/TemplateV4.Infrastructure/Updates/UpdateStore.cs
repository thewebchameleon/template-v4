using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Updates;

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
