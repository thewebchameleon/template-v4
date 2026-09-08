using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application;
using TemplateV4.Application.Users;
using TemplateV4.Domain.Users;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Directory_exposes_separate_usernames_and_sorts_and_searches_identity_columns()
    {
        await using var scope = _services.CreateAsyncScope();
        var sp = scope.ServiceProvider;
        await AccessActor(sp);
        var users = sp.GetRequiredService<UserManager<AppUser>>();
        var db = sp.GetRequiredService<FrameworkDb>();
        var entries = new List<AppUser>();
        foreach (var (username, email) in new[] { ("directory-check-z", "a@example.test"), ("directory-check-a", "z@example.test"), ("directory-check-m", "m@example.test") })
        {
            var user = new AppUser { Id = Guid.NewGuid(), UserName = username, Email = email };
            Assert.True((await users.CreateAsync(user)).Succeeded);
            db.Profiles.Add(UserProfile.Create(user.Id, "Shared display name", "en-ZA"));
            entries.Add(user);
        }
        await db.SaveChangesAsync();
        var directory = sp.GetRequiredService<IUserDirectory>();
        foreach (var column in new[] { "username", "email" })
        {
            foreach (var direction in new[] { "asc", "desc" })
            {
                var query = new ListUsers(PageSize: 2, Search: "directory-check", Sort: column, Direction: direction);
                Assert.Empty(new ListUsersValidator().Validate(query));
                var first = await directory.List(query, default);
                var second = await directory.List(query with { PageNumber = 2 }, default);
                var expected = entries.OrderBy(u => column == "username" ? u.UserName : u.Email).Select(u => u.Id);
                if (direction == "desc") expected = expected.Reverse();
                Assert.Equal(3, first.Total);
                Assert.Equal(expected, first.Items.Concat(second.Items).Select(u => u.Id));
                Assert.All(first.Items, u => Assert.NotEqual(u.Email, u.Username));
            }
        }
        var match = Assert.Single((await directory.List(new(Search: "directory-check-z"), default)).Items);
        Assert.Equal("directory-check-z", match.Username);
        Assert.Equal("a@example.test", match.Email);
        var detail = await sp.GetRequiredService<AccessManagementService>().User(match.Id, default);
        Assert.True(detail.IsSuccess);
        Assert.Equal(match.Username, detail.Value!.User.Username);
    }

    private async Task<AppUser> AccessActor(IServiceProvider sp)
    {
        var actor = await User(sp);
        var context = sp.GetRequiredService<BackgroundExecutionContext>();
        context.ActorId = actor.Id; context.Permissions = Permissions.All.ToHashSet();
        return actor;
    }

    [Fact]
    public async Task Access_roles_protect_builtins_validate_dependencies_and_reject_stale_edits()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        await AccessActor(sp); var access = sp.GetRequiredService<AccessManagementService>();
        var catalog = (await access.Catalog(1, 25, null, "name", "asc", default)).Value!;
        Assert.Contains(catalog.Permissions, p => p.Key == Permissions.Roles);
        var admin = Assert.Single(catalog.Roles.Items, r => r.Name == "Administrator");
        Assert.Equal("role.protected", (await access.Save(admin.Id, new("Administrator", "", [], admin.Version), default)).Error!.Code);
        Assert.Equal("role.invalid", (await access.Save(null, new("Invalid", "", [Permissions.Manage]), default)).Error!.Code);
        var created = await access.Save(null, new("Support", "Support operators", [Permissions.Read]), default);
        Assert.True(created.IsSuccess); Assert.False(created.Value!.BuiltIn);
        var changed = await access.Save(created.Value.Id, new("Support", "Updated", [Permissions.Read, Permissions.Manage], created.Value.Version), default);
        Assert.True(changed.IsSuccess); Assert.NotEqual(created.Value.Version, changed.Value!.Version);
        Assert.Equal("concurrency.conflict", (await access.Save(created.Value.Id, new("Support", "Stale", [], created.Value.Version), default)).Error!.Code);
        Assert.Equal("role.exists", (await access.Save(null, new("support", "", []), default)).Error!.Code);
        var paged = (await access.Catalog(1, 1, null, "members", "desc", default)).Value!.Roles;
        Assert.Single(paged.Items); Assert.True(paged.Total >= 3); Assert.Equal(1, paged.PageSize);
        var db = sp.GetRequiredService<FrameworkDb>();
        Assert.Contains(await db.Audit.ToArrayAsync(), e => e.SubjectId == created.Value.Id && e.Action == "role.granted:users.manage");
    }

    [Fact]
    public async Task Access_role_change_revokes_members_sessions_and_reports_effective_sources()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        await AccessActor(sp); var access = sp.GetRequiredService<AccessManagementService>();
        var role = (await access.Save(null, new("Auditor", "Review activity", [Permissions.Settings]), default)).Value!;
        var member = await User(sp); var users = sp.GetRequiredService<UserManager<AppUser>>();
        await users.RemoveFromRoleAsync(member, "Administrator"); await users.AddToRoleAsync(member, role.Name);
        var db = sp.GetRequiredService<FrameworkDb>();
        var auth = sp.GetRequiredService<AuthService>(); var session = await auth.CreateSession(member, "test", true, default); await db.SaveChangesAsync();
        Assert.Contains(Permissions.Settings, session.Access.Permissions);
        var detail = (await access.User(member.Id, default)).Value!;
        Assert.Equal([Permissions.Settings], detail.EffectivePermissions); Assert.Equal(role.Name, Assert.Single(detail.Roles).Name);
        Assert.True(await sp.GetRequiredService<SecurityService>().GloballyRequired(member, default));
        var result = await access.Save(role.Id, new(role.Name, "No administrative access", [], role.Version), default);
        Assert.True(result.IsSuccess); Assert.Equal(1, result.Value!.Members);
        Assert.True(await db.Sessions.Where(s => s.UserId == member.Id).AllAsync(s => s.RevokedAt != null));
        // Refresh is a separate HTTP request and must observe persisted revocation in a fresh scope.
        await using var refreshScope = _services.CreateAsyncScope();
        Assert.False((await refreshScope.ServiceProvider.GetRequiredService<AuthService>().Refresh(session.RefreshToken, default)).IsSuccess);
        Assert.Empty((await access.User(member.Id, default)).Value!.EffectivePermissions);
    }

    [Fact]
    public async Task Access_delegation_uses_live_permissions_and_cannot_edit_own_role_or_assign_stronger_access()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var actor = await AccessActor(sp); var access = sp.GetRequiredService<AccessManagementService>();
        var delegated = (await access.Save(null, new("Delegated", "", [Permissions.Read, Permissions.Manage, Permissions.Roles]), default)).Value!;
        var stronger = (await access.Save(null, new("Policy operators", "", [Permissions.Settings]), default)).Value!;
        var users = sp.GetRequiredService<UserManager<AppUser>>();
        await users.RemoveFromRoleAsync(actor, "Administrator"); await users.AddToRoleAsync(actor, delegated.Name);
        // Deliberately retain the old all-permissions execution context to simulate stale claims.
        Assert.Equal("role.delegation_denied", (await access.Save(null, new("Escalation", "", [Permissions.Settings]), default)).Error!.Code);
        Assert.Equal("role.self_edit", (await access.Save(delegated.Id, new(delegated.Name, "", delegated.Permissions, delegated.Version), default)).Error!.Code);
        Assert.Equal("role.delegation_denied", (await access.Save(stronger.Id, new(stronger.Name, "", [], stronger.Version), default)).Error!.Code);
        var dispatcher = sp.GetRequiredService<Dispatcher<CreateUser, UserDto>>();
        Assert.Equal("role.delegation_denied", (await dispatcher.Send(new("escalation@example.test", "Escalation", "en-ZA", ["Administrator"]))).Error!.Code);
        Assert.True((await dispatcher.Send(new("reader@example.test", "Reader", "en-ZA", ["Reader"]))).IsSuccess);
    }

    [Fact]
    public async Task Access_concurrent_role_edits_have_one_winner()
    {
        Guid actorId; RoleItem role;
        await using (var scope = _services.CreateAsyncScope())
        {
            actorId = (await AccessActor(scope.ServiceProvider)).Id;
            role = (await scope.ServiceProvider.GetRequiredService<AccessManagementService>().Save(null, new("Concurrent", "", [Permissions.Read]), default)).Value!;
        }
        async Task<Result<RoleItem>> Edit(string description)
        {
            await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
            var context = sp.GetRequiredService<BackgroundExecutionContext>(); context.ActorId = actorId; context.Permissions = Permissions.All.ToHashSet();
            return await sp.GetRequiredService<AccessManagementService>().Save(role.Id, new(role.Name, description, role.Permissions, role.Version), default);
        }
        var results = await Task.WhenAll(Edit("first"), Edit("second"));
        Assert.Single(results, r => r.IsSuccess); Assert.Single(results, r => r.Error?.Code == "concurrency.conflict");
    }

    [Fact]
    public async Task Access_directory_pages_1001_accounts_and_notification_summary_is_owner_scoped()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var actor = await AccessActor(sp); var db = sp.GetRequiredService<FrameworkDb>();
        for (var i = 0; i < 1000; i++)
        {
            var id = Guid.NewGuid(); var email = $"person{i:D4}@example.test";
            db.Users.Add(new() { Id = id, UserName = email, NormalizedUserName = email.ToUpperInvariant(), Email = email, NormalizedEmail = email.ToUpperInvariant() });
            db.Profiles.Add(UserProfile.Create(id, $"Person {i:D4}", "en-ZA", false));
        }
        db.Notifications.AddRange(new UserNotification { UserId = actor.Id, Kind = "notificationSecurity", Link = "/security", CreatedAt = _clock.Now },
            new UserNotification { UserId = actor.Id, Kind = "notificationSecurity", Link = "/security", CreatedAt = _clock.Now, ReadAt = _clock.Now });
        await db.SaveChangesAsync();
        var directory = sp.GetRequiredService<IUserDirectory>(); var first = await directory.List(new(PageSize: 25), default); var second = await directory.List(new(PageNumber: 2, PageSize: 25), default);
        Assert.Equal(1001, first.Total); Assert.Equal(25, first.Items.Count); Assert.Empty(first.Items.Select(x => x.Id).Intersect(second.Items.Select(x => x.Id)));
        Assert.Equal(1, (await directory.List(new(Search: "person0999"), default)).Total);
        var notifications = sp.GetRequiredService<NotificationService>(); Assert.Equal(1, (await notifications.Summary(actor.Id, default)).Unread); Assert.Equal(0, (await notifications.Summary(Guid.NewGuid(), default)).Unread);
        await notifications.Read(actor.Id, null, true, default); Assert.Equal(0, (await notifications.Summary(actor.Id, default)).Unread);
    }
}
