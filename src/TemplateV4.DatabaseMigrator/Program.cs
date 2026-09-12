using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;
using TemplateV4.Application.Users;
using TemplateV4.Domain.Users;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);
builder.Services.AddScoped<IExecutionContext, BackgroundExecutionContext>();
await using var app = builder.Build();
await using var scope = app.Services.CreateAsyncScope();
var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
await db.Database.OpenConnectionAsync();
await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_lock(74842000)");
try
{
    await db.Database.MigrateAsync();
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
            GRANT USAGE ON SCHEMA app, identity, messaging, audit, files, support TO templatev4_api, templatev4_worker;
            GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app, identity, messaging, files, support TO templatev4_api, templatev4_worker;
            GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA audit TO templatev4_api, templatev4_worker;
            GRANT USAGE ON ALL SEQUENCES IN SCHEMA app, identity, messaging, audit, files, support TO templatev4_api, templatev4_worker;
            GRANT USAGE ON SCHEMA quartz TO templatev4_worker;
            GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA quartz TO templatev4_worker;
            GRANT USAGE ON ALL SEQUENCES IN SCHEMA quartz TO templatev4_worker;
            REVOKE ALL ON app.migrations FROM templatev4_api, templatev4_worker;
            """);
}
finally { await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_unlock(74842000)"); }
