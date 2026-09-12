using System.Diagnostics;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using TemplateV4.Application.Platform;

namespace TemplateV4.Infrastructure.Persistence;

/// <summary>Enriches explicitly authored events; never serializes entities or request payloads.</summary>
public sealed class AuditCapture(IExecutionContext context, IHttpContextAccessor http) : SaveChangesInterceptor
{
    public static string Changes(params AuditChange[] changes) => JsonSerializer.Serialize(changes.Where(x => x.Before != x.After));

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not FrameworkDb db) return result;
        var entries = db.ChangeTracker.Entries<AuditEntry>().Where(x => x.State == EntityState.Added).Select(x => x.Entity).ToArray();
        if (entries.Length == 0) return result;
        var ids = entries.SelectMany(x => new[] { x.ActorId, x.SubjectId }).OfType<Guid>().Distinct().ToArray();
        var profiles = await db.Profiles.AsNoTracking().Where(x => ids.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.DisplayName, cancellationToken);
        var roles = await db.Roles.AsNoTracking().Where(x => ids.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.Name, cancellationToken);
        var files = await db.Files.AsNoTracking().Where(x => ids.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.Name, cancellationToken);
        foreach (var profile in db.Profiles.Local.Where(x => db.Entry(x).State is EntityState.Added or EntityState.Modified)) profiles[profile.Id] = profile.DisplayName;
        foreach (var role in db.Roles.Local.Where(x => db.Entry(x).State is EntityState.Added or EntityState.Modified)) roles[role.Id] = role.Name;
        foreach (var file in db.Files.Local.Where(x => db.Entry(x).State is EntityState.Added or EntityState.Modified)) files[file.Id] = file.Name;
        foreach (var entry in entries)
        {
            entry.SchemaVersion = 1;
            entry.ActorType ??= entry.ActorId is null ? "system" : "user";
            if (entry.ActorId is { } actor) entry.ActorNameSnapshot ??= profiles.GetValueOrDefault(actor);
            entry.Source ??= entry.Action.StartsWith("bootstrap.", StringComparison.Ordinal) ? "bootstrap" : http.HttpContext is not null ? "api" : "background";
            entry.Outcome ??= "success";
            entry.TraceParent ??= Activity.Current?.Id ?? context.TraceParent;
            if (entry.SubjectId is { } subject)
            {
                entry.SubjectType ??= profiles.ContainsKey(subject) ? "user" : roles.ContainsKey(subject) ? "role" : files.ContainsKey(subject) ? "file" : null;
                entry.SubjectNameSnapshot ??= entry.SubjectType switch
                {
                    "user" => profiles.GetValueOrDefault(subject),
                    "role" => roles.GetValueOrDefault(subject),
                    "file" => files.GetValueOrDefault(subject),
                    _ => null
                };
            }
        }
        return result;
    }
}
