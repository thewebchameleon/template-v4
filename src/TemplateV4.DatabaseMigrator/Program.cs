using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TemplateV4.Application;
using TemplateV4.Application.Users;
using TemplateV4.Domain.Users;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.ServiceDefaults;

var builder = Host.CreateApplicationBuilder(args);
TemplateV4.Host.BusinessModules.ConfigureClient(builder);
builder.AddServiceDefaults();
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment, TemplateV4.Host.BusinessModules.Descriptors);
TemplateV4.Host.BusinessModules.Configure(builder);
builder.Services.AddScoped<IExecutionContext, BackgroundExecutionContext>();
using var app = builder.Build();
await using var scope = app.Services.CreateAsyncScope();
var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
await db.Database.OpenConnectionAsync();
await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_lock(74842000)");
try
{
    await db.Database.MigrateAsync();
    foreach (var contributor in scope.ServiceProvider.GetServices<TemplateV4.Application.Modules.IMigrationContributor>().OrderBy(x => x.Order).ThenBy(x => x.ModuleId, StringComparer.Ordinal))
        await contributor.Migrate(CancellationToken.None);
    var catalog = scope.ServiceProvider.GetRequiredService<TemplateV4.Application.Modules.ModuleCatalog>();
    var newlyInstalled = new HashSet<string>(StringComparer.Ordinal);
    var automaticallyEnabled = new HashSet<string>(StringComparer.Ordinal);
    foreach (var module in catalog.Definitions.Where(x => x.RuntimeConfigurable))
        if (!await db.RuntimeModules.AnyAsync(x => x.Id == module.Id))
        {
            db.RuntimeModules.Add(new() { Id = module.Id, Enabled = module.Category == "private", Version = Guid.NewGuid() });
            if (module.Category == "private")
            {
                newlyInstalled.Add(module.Id);
                automaticallyEnabled.Add(module.Id);
            }
        }
    var requiredByNewModules = new HashSet<string>(newlyInstalled, StringComparer.Ordinal);
    var pending = new Stack<string>(newlyInstalled);
    while (pending.TryPop(out var id))
        foreach (var dependency in catalog.Definitions.Single(x => x.Id == id).Dependencies)
            if (requiredByNewModules.Add(dependency)) pending.Push(dependency);
    if (requiredByNewModules.Count > 0)
        foreach (var row in await db.RuntimeModules.Where(x => requiredByNewModules.Contains(x.Id) && !x.Enabled).ToArrayAsync())
        {
            row.Enabled = true;
            row.Version = Guid.NewGuid();
            automaticallyEnabled.Add(row.Id);
        }
    foreach (var id in automaticallyEnabled)
        db.Audit.Add(new()
        {
            Action = "module.auto_enabled",
            At = DateTimeOffset.UtcNow,
            Source = "migrator",
            SubjectType = "module",
            SubjectNameSnapshot = id,
            Outcome = "success",
            MetadataJson = JsonSerializer.Serialize(new { ModuleId = id })
        });
    foreach (var row in await db.RuntimeModules.Where(x => x.Version == Guid.Empty).ToArrayAsync()) row.Version = Guid.NewGuid();
    var updates = scope.ServiceProvider.GetRequiredService<TemplateV4.Infrastructure.Updates.UpdateConfiguration>();
    if (updates.Installed.Components.Any(x => x.Id != "foundation"))
    {
        var deployment = await db.Set<TemplateV4.Infrastructure.Updates.UpdateState>().SingleOrDefaultAsync(x => x.Id == 1);
        if (deployment is null)
        {
            deployment = new();
            db.Add(deployment);
        }
        deployment.InstalledHash = updates.InstalledHash;
        deployment.Status = "pending";
        deployment.CheckedAt = null;
        deployment.SucceededAt = null;
        deployment.ReleasesJson = "[]";
    }
    await db.SaveChangesAsync();
    var roles = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    foreach (var name in new[] { "Administrator", "Reader" })
    {
        await using var roleTransaction = await db.Database.BeginTransactionAsync();
        var role = await roles.FindByNameAsync(name);
        if (role is null)
        {
            role = new(name) { Id = Guid.NewGuid() };
            if (!(await roles.CreateAsync(role)).Succeeded) throw new InvalidOperationException("Role seed failed.");
        }
        var existing = await roles.GetClaimsAsync(role);
        var desired = name == "Administrator" ? Permissions.All : Array.Empty<string>();
        var changed = false;
        foreach (var claim in existing.Where(claim => claim.Type == "permission" && !desired.Contains(claim.Value)))
        {
            if (!(await roles.RemoveClaimAsync(role, claim)).Succeeded) throw new InvalidOperationException("Permission removal failed.");
            changed = true;
        }
        foreach (var permission in desired)
            if (!existing.Any(x => x.Type == "permission" && x.Value == permission))
            {
                if (!(await roles.AddClaimAsync(role, new Claim("permission", permission))).Succeeded) throw new InvalidOperationException("Permission seed failed.");
                changed = true;
            }
        if (changed)
        {
            var members = db.UserRoles.Where(member => member.RoleId == role.Id).Select(member => member.UserId);
            await db.Sessions.Where(session => members.Contains(session.UserId) && session.RevokedAt == null).ExecuteUpdateAsync(update => update.SetProperty(session => session.RevokedAt, DateTimeOffset.UtcNow));
            db.Audit.Add(new() { Action = "role.permissions_changed", SubjectId = role.Id, At = DateTimeOffset.UtcNow });
            await db.SaveChangesAsync();
        }
        await roleTransaction.CommitAsync();
    }
    if (builder.Configuration.GetValue("Database:GrantRuntimeRoles", false))
        await db.Database.ExecuteSqlRawAsync("""
            GRANT USAGE ON SCHEMA app, identity, messaging, audit, files, support, crm, invoicing, cms, website, contact TO templatev4_api, templatev4_worker;
            GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app, identity, messaging, files, support, crm, invoicing, cms, website, contact TO templatev4_api, templatev4_worker;
            GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA audit TO templatev4_api, templatev4_worker;
            GRANT USAGE ON ALL SEQUENCES IN SCHEMA app, identity, messaging, audit, files, support, crm, invoicing, cms, website, contact TO templatev4_api, templatev4_worker;
            GRANT USAGE ON SCHEMA quartz TO templatev4_worker;
            GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA quartz TO templatev4_worker;
            GRANT USAGE ON ALL SEQUENCES IN SCHEMA quartz TO templatev4_worker;
            REVOKE ALL ON app.migrations FROM templatev4_api, templatev4_worker;
            """);
}
finally { await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_unlock(74842000)"); }
