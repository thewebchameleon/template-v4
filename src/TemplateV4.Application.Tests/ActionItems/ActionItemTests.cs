using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Action_items_enforce_visibility_live_permissions_and_single_completion()
    {
        Guid itemId; Guid firstId; Guid secondId;
        await using (var scope = _services.CreateAsyncScope())
        {
            var sp = scope.ServiceProvider; var creator = await User(sp); var first = await User(sp); var second = await User(sp);
            firstId = first.Id; secondId = second.Id;
            var manager = sp.GetRequiredService<UserManager<AppUser>>();
            await manager.RemoveFromRoleAsync(creator, "Administrator"); await manager.AddToRoleAsync(creator, "Reader");
            var roles = sp.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
            var delegated = new IdentityRole<Guid>("Queue outsider") { Id = Guid.NewGuid() };
            Assert.True((await roles.CreateAsync(delegated)).Succeeded);
            Assert.True((await roles.AddClaimAsync(delegated, new("permission", Permissions.Settings))).Succeeded);
            Assert.True((await manager.AddToRoleAsync(creator, delegated.Name!)).Succeeded);
            var items = sp.GetRequiredService<IActionItems>();
            var result = await items.Create(creator.Id, new("Please review", "Details", "/dashboard", QueueId: ActionQueues.PrivacyReviews), default);
            Assert.True(result.IsSuccess); itemId = result.Value;
            Assert.Empty((await items.List(creator.Id, new(), default)).Value!.Items);
            Assert.Single((await items.List(creator.Id, new(Scope: "overview"), default)).Value!.Items);
            Assert.Equal(ActionQueues.PrivacyReviews, Assert.Single((await items.List(first.Id, new(), default)).Value!.Items).QueueId);
            foreach (var sort in new[] { "title", "source", "state", "assignee", "createdAt" }) Assert.Single((await items.List(first.Id, new(Sort: sort), default)).Value!.Items);
            var db = sp.GetRequiredService<FrameworkDb>();
            Assert.Equal(2, await db.Notifications.CountAsync(x => x.Kind == "notificationActionAssigned"));
            await manager.RemoveFromRoleAsync(first, "Administrator");
            Assert.Empty((await items.List(first.Id, new(), default)).Value!.Items);
            Assert.False((await items.Complete(first.Id, itemId, default)).IsSuccess);
            await manager.AddToRoleAsync(first, "Administrator");
        }
        async Task<Result<Unit>> Complete(Guid actor)
        {
            await using var scope = _services.CreateAsyncScope();
            return await scope.ServiceProvider.GetRequiredService<IActionItems>().Complete(actor, itemId, default);
        }
        var results = await Task.WhenAll(Complete(firstId), Complete(secondId));
        Assert.Single(results, x => x.IsSuccess);
        await using var check = _services.CreateAsyncScope();
        Assert.Equal(1, await check.ServiceProvider.GetRequiredService<FrameworkDb>().Audit.CountAsync(x => x.SubjectId == itemId && x.Action == "action_item.completed"));
    }

    [Fact]
    public async Task Action_items_allow_person_or_creator_and_reject_external_links_and_system_completion()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var creator = await User(sp); var assignee = await User(sp); var outsider = await User(sp);
        var manager = sp.GetRequiredService<UserManager<AppUser>>(); await manager.RemoveFromRoleAsync(outsider, "Administrator"); await manager.AddToRoleAsync(outsider, "Reader");
        var items = sp.GetRequiredService<IActionItems>();
        foreach (var link in new[] { "https://evil.test", "//evil.test", "/\\evil.test", "/%2fevil.test", "/api/v1/users", "/ bad" }) Assert.False((await items.Create(creator.Id, new("Work", "", link, assignee.Id), default)).IsSuccess);
        Assert.False((await items.Create(creator.Id, new("Work", "", "/dashboard", assignee.Id, ActionQueues.PrivacyReviews), default)).IsSuccess);
        Assert.False((await items.Create(creator.Id, new("Work", "", "/dashboard", QueueId: "settings.manage"), default)).IsSuccess);
        var item = (await items.Create(creator.Id, new("Work", "Details", "/dashboard", assignee.Id), default)).Value;
        Assert.Empty((await items.List(outsider.Id, new(Scope: "overview"), default)).Value!.Items);
        Assert.False((await items.Complete(outsider.Id, item, default)).IsSuccess);
        Assert.True((await items.Complete(creator.Id, item, default)).IsSuccess);
        var other = (await items.Create(creator.Id, new("Work", "Details", "/dashboard", assignee.Id), default)).Value;
        Assert.True((await items.Complete(assignee.Id, other, default)).IsSuccess);
        var privacy = sp.GetRequiredService<PrivacyService>();
        Assert.True((await privacy.RequestDeletion(outsider.Id, default)).IsSuccess);
        Assert.True((await privacy.RequestDeletion(outsider.Id, default)).IsSuccess);
        var db = sp.GetRequiredService<FrameworkDb>(); var review = await db.Set<ActionItemRow>().SingleAsync(x => x.Source == "Privacy");
        Assert.False((await items.Complete(creator.Id, review.Id, default)).IsSuccess);
        var roles = sp.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var delegated = new IdentityRole<Guid>("Settings operator") { Id = Guid.NewGuid() };
        Assert.True((await roles.CreateAsync(delegated)).Succeeded);
        Assert.True((await roles.AddClaimAsync(delegated, new("permission", Permissions.Settings))).Succeeded);
        Assert.True((await manager.AddToRoleAsync(outsider, delegated.Name!)).Succeeded);
        Assert.Empty((await items.List(outsider.Id, new(), default)).Value!.Items);
        Assert.False((await privacy.Review(outsider.Id, new(review.SourceId!.Value, false), default)).IsSuccess);
        Assert.True((await privacy.Withdraw(outsider.Id, default)).IsSuccess);
        await db.Entry(review).ReloadAsync(); Assert.Equal("Completed", review.State);
        Assert.True((await items.Create(creator.Id, new("Private work", "Erase this content", "/dashboard", outsider.Id), default)).IsSuccess);
        Assert.Contains("Erase this content", System.Text.Encoding.UTF8.GetString(await privacy.Export(outsider.Id, default)), StringComparison.Ordinal);
        Assert.True((await privacy.RequestDeletion(outsider.Id, default)).IsSuccess);
        var deletion = (await privacy.Status(outsider.Id, default)).Request!;
        Assert.True((await privacy.Review(creator.Id, new(deletion.Id, true), default)).IsSuccess);
        Assert.False(await db.Set<ActionItemRow>().AnyAsync(x => x.AssigneeId == outsider.Id || x.SubjectId == outsider.Id));
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Registration_approval_requires_verified_email_and_one_administrator_decision(bool approve)
    {
        Guid userId; Guid adminId;
        await using (var scope = _services.CreateAsyncScope())
        {
            var sp = scope.ServiceProvider; var admin = await User(sp); adminId = admin.Id;
            var db = sp.GetRequiredService<FrameworkDb>(); db.SecuritySettings.Add(new() { RegistrationEnabled = true, RegistrationApprovalRequired = true, MfaPolicy = "Optional" }); await db.SaveChangesAsync();
            var registration = sp.GetRequiredService<RegistrationService>();
            Assert.True((await registration.Register(new("pending@example.test", "Applicant", "Test-only!Password942", "en-ZA"), default)).IsSuccess);
            var manager = sp.GetRequiredService<UserManager<AppUser>>(); var user = (await manager.FindByEmailAsync("pending@example.test"))!; userId = user.Id;
            Assert.Equal("Pending", user.RegistrationState);
            Assert.Empty(await db.Set<ActionItemRow>().ToArrayAsync());
            Assert.False((await sp.GetRequiredService<RegistrationReviewService>().Review(admin.Id, new(user.Id, approve), default)).IsSuccess);
            var token = await manager.GenerateEmailConfirmationTokenAsync(user);
            Assert.True((await sp.GetRequiredService<AccountService>().Confirm(new(user.Id, token), default)).IsSuccess);
            Assert.Equal(ActionQueues.RegistrationApprovals, Assert.Single(await db.Set<ActionItemRow>().ToArrayAsync()).QueueId);
            // Turning the setting off does not implicitly approve an existing application.
            var settings = await db.SecuritySettings.SingleAsync(); settings.RegistrationApprovalRequired = false; await db.SaveChangesAsync();
            Assert.False((await sp.GetRequiredService<AuthService>().Login(new(user.Email!, "Test-only!Password942", "test"), default)).IsSuccess);
            Assert.False((await sp.GetRequiredService<RegistrationReviewService>().Review(user.Id, new(user.Id, approve), default)).IsSuccess);
            Assert.Equal("NotRequired", admin.RegistrationState);
        }
        async Task<Result<Unit>> Review()
        {
            await using var scope = _services.CreateAsyncScope();
            return await scope.ServiceProvider.GetRequiredService<RegistrationReviewService>().Review(adminId, new(userId, approve), default);
        }
        Assert.Single(await Task.WhenAll(Review(), Review()), x => x.IsSuccess);
        await using var check = _services.CreateAsyncScope(); var services = check.ServiceProvider; var database = services.GetRequiredService<FrameworkDb>();
        Assert.Equal(approve ? "Approved" : "Rejected", (await database.Users.SingleAsync(x => x.Id == userId)).RegistrationState);
        Assert.Equal("Completed", (await database.Set<ActionItemRow>().SingleAsync()).State);
        Assert.Equal(approve, (await services.GetRequiredService<AuthService>().Login(new("pending@example.test", "Test-only!Password942", "test"), default)).IsSuccess);
        var template = approve ? EmailTemplate.RegistrationApproved : EmailTemplate.RegistrationRejected;
        var messages = await database.Outbox.Where(x => x.Type == "email.requested.v1").Select(x => x.Payload).ToArrayAsync();
        Assert.Single(messages.Select(x => System.Text.Json.JsonSerializer.Deserialize<EmailRequest>(x)!), x => x.Template == template);
    }
}
