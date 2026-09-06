using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Domain.Users;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using TemplateV4.Infrastructure.Storage;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Baseline_files_enforce_owner_type_quota_and_deleted_access()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp); var other = await User(sp); var files = sp.GetRequiredService<FileService>(); var db = sp.GetRequiredService<FrameworkDb>();
        using var content = new MemoryStream("private document"u8.ToArray());
        var result = await files.Upload(user.Id, "notes.txt", content, default); Assert.True(result.IsSuccess);
        Assert.Equal(0, (await files.List(other.Id, 1, null, "name", default)).Value!.Page.Total);
        Assert.Equal(ErrorKind.NotFound, (await files.Download(other.Id, result.Value!.Id, default)).Error!.Kind);
        var download = await files.Download(user.Id, result.Value.Id, default); Assert.True(download.IsSuccess);
        using (var reader = new StreamReader(download.Value!.Content)) Assert.Equal("private document", await reader.ReadToEndAsync());
        using var invalid = new MemoryStream("not a png"u8.ToArray());
        Assert.Equal("files.invalid_type", (await files.Upload(user.Id, "image.png", invalid, default)).Error!.Code);
        Assert.Equal(ErrorKind.NotFound, (await files.Delete(other.Id, result.Value.Id, default)).Error!.Kind);
        Assert.True((await files.Delete(user.Id, result.Value.Id, default)).IsSuccess);
        Assert.False((await files.Download(user.Id, result.Value.Id, default)).IsSuccess);
        Assert.Equal(0, (await files.List(user.Id, 1, null, "newest", default)).Value!.Page.Total);
        Assert.Equal(content.Length, (await files.List(user.Id, 1, null, "newest", default)).Value!.UsedBytes);
        db.Files.Add(new() { OwnerId = user.Id, Name = "reserved.txt", Size = 1024L * 1024 * 1024, CreatedAt = _clock.Now }); await db.SaveChangesAsync();
        using var blocked = new MemoryStream("quota"u8.ToArray());
        Assert.Equal("files.quota", (await files.Upload(user.Id, "quota.txt", blocked, default)).Error!.Code);
        Assert.Contains(await db.Audit.ToArrayAsync(), x => x.SubjectId == result.Value.Id && x.Action == "file.deleted");
    }

    [Fact]
    public async Task Baseline_notifications_commit_with_events_and_read_is_owner_scoped()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider; var user = await User(sp); var other = await User(sp);
        var db = sp.GetRequiredService<FrameworkDb>(); var outbox = sp.GetRequiredService<IEventOutbox>();
        await using (var tx = await db.Database.BeginTransactionAsync())
        {
            outbox.Add(new EmailRequest(user.Id, EmailTemplate.SecurityNotification, "en-ZA")); await db.SaveChangesAsync(); await tx.RollbackAsync();
        }
        db.ChangeTracker.Clear(); Assert.Empty(await db.Notifications.ToArrayAsync());
        outbox.Add(new EmailRequest(user.Id, EmailTemplate.SecurityNotification, "en-ZA")); await db.SaveChangesAsync();
        var notifications = sp.GetRequiredService<NotificationService>();
        var page = (await notifications.List(user.Id, 1, true, default)).Value!; Assert.Equal(1, page.Unread); Assert.False(page.OptionalEmailEnabled);
        await notifications.Read(other.Id, page.Page.Items[0].Id, default); Assert.Equal(1, (await notifications.List(user.Id, 1, true, default)).Value!.Unread);
        await notifications.Read(user.Id, page.Page.Items[0].Id, default); Assert.Equal(0, (await notifications.List(user.Id, 1, true, default)).Value!.Unread);
        await notifications.Preferences(user.Id, new(true), default); Assert.True((await notifications.List(user.Id, 1, false, default)).Value!.OptionalEmailEnabled);
    }

    [Fact]
    public async Task Baseline_privacy_export_excludes_secrets_and_approval_anonymises_atomically()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var reviewer = await User(sp); var user = await User(sp); var db = sp.GetRequiredService<FrameworkDb>(); var privacy = sp.GetRequiredService<PrivacyService>();
        var originalEmail = user.Email!;
        sp.GetRequiredService<IEventOutbox>().Add(new EmailRequest(user.Id, EmailTemplate.SecurityNotification, "en-ZA", ProtectedRecipient: "encrypted-recipient"));
        db.Sessions.Add(new() { UserId = user.Id, SecurityStamp = user.SecurityStamp!, Device = "Browser", CreatedAt = _clock.Now, ExpiresAt = _clock.Now.AddDays(1) });
        db.Files.Add(new() { OwnerId = user.Id, Name = "personal.txt", Size = 12, Ready = true, CreatedAt = _clock.Now });
        await db.SaveChangesAsync();
        var exported = Encoding.UTF8.GetString(await privacy.Export(user.Id, default));
        Assert.Contains(originalEmail, exported); Assert.DoesNotContain(user.PasswordHash!, exported); Assert.DoesNotContain(user.SecurityStamp!, exported);
        Assert.True((await privacy.RequestDeletion(user.Id, default)).IsSuccess); Assert.True((await privacy.RequestDeletion(user.Id, default)).IsSuccess);
        Assert.Equal(1, await db.DeletionRequests.CountAsync());
        var request = (await privacy.Status(user.Id, default)).Request!;
        Assert.Equal("user.self_lockout", (await privacy.Review(user.Id, new(request.Id, true), default)).Error!.Code);
        Assert.True((await privacy.Withdraw(user.Id, default)).IsSuccess);
        Assert.False((await privacy.Review(reviewer.Id, new(request.Id, true), default)).IsSuccess);
        Assert.True((await privacy.RequestDeletion(user.Id, default)).IsSuccess);
        request = (await privacy.Status(user.Id, default)).Request!;
        Assert.True((await privacy.Review(reviewer.Id, new(request.Id, true), default)).IsSuccess);
        db.ChangeTracker.Clear();
        var deleted = await db.Users.SingleAsync(x => x.Id == user.Id); Assert.Null(deleted.PasswordHash); Assert.EndsWith("@example.invalid", deleted.Email);
        Assert.False(await db.Profiles.AnyAsync(x => x.Id == user.Id)); Assert.Empty(await db.Sessions.Where(x => x.UserId == user.Id).ToArrayAsync());
        Assert.True(await db.Files.Where(x => x.OwnerId == user.Id).AllAsync(x => x.DeletedAt != null));
        Assert.True(await db.Audit.AnyAsync(x => x.SubjectId == user.Id && x.Action == "privacy.account_anonymised"));
        Assert.Equal("Approved", (await db.DeletionRequests.SingleAsync(x => x.Id == request.Id)).State);
        Assert.DoesNotContain(await db.Outbox.Select(x => x.Payload).ToArrayAsync(), x => x.Contains("encrypted-recipient", StringComparison.Ordinal));
    }

    [Fact]
    public async Task Baseline_privacy_protects_last_administrator_and_review_races()
    {
        Guid userId; Guid requestId;
        await using (var scope = _services.CreateAsyncScope())
        {
            var sp = scope.ServiceProvider; var user = await User(sp); userId = user.Id; var privacy = sp.GetRequiredService<PrivacyService>();
            await privacy.RequestDeletion(userId, default); requestId = (await privacy.Status(userId, default)).Request!.Id;
            Assert.Equal("user.last_administrator", (await privacy.Review(Guid.NewGuid(), new(requestId, true), default)).Error!.Code);
            await User(sp);
        }
        async Task<Result<Unit>> Review(bool approve)
        {
            await using var scope = _services.CreateAsyncScope(); return await scope.ServiceProvider.GetRequiredService<PrivacyService>().Review(Guid.NewGuid(), new(requestId, approve), default);
        }
        var outcomes = await Task.WhenAll(Review(true), Review(false)); Assert.Single(outcomes, x => x.IsSuccess);
    }

    [Fact]
    public async Task Baseline_email_change_is_encrypted_verified_and_single_use()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider; var user = await User(sp);
        var privacy = sp.GetRequiredService<PrivacyService>(); var db = sp.GetRequiredService<FrameworkDb>(); var nextEmail = "new-" + Guid.NewGuid().ToString("N") + "@example.test";
        db.Sessions.Add(new() { UserId = user.Id, CreatedAt = _clock.Now, ExpiresAt = _clock.Now.AddDays(1), SecurityStamp = user.SecurityStamp! }); await db.SaveChangesAsync();
        var oldEmail = user.Email;
        Assert.True((await privacy.ChangeEmail(user.Id, new(nextEmail, new("Test-only!Password942")), default)).IsSuccess);
        Assert.Equal(oldEmail, (await db.Users.AsNoTracking().SingleAsync(x => x.Id == user.Id)).Email);
        var row = await db.AuthChallenges.SingleAsync(x => x.UserId == user.Id); Assert.DoesNotContain(nextEmail, row.State);
        var email = JsonSerializer.Deserialize<EmailRequest>((await db.Outbox.OrderBy(x => x.CreatedAt).ToArrayAsync()).Single(x => JsonSerializer.Deserialize<EmailRequest>(x.Payload)!.Template == EmailTemplate.Verification).Payload)!;
        Assert.DoesNotContain(nextEmail, JsonSerializer.Serialize(email));
        var link = sp.GetRequiredService<IDataProtectionProvider>().CreateProtector("TemplateV4.email.action.v1").Unprotect(email.ActionUrl!);
        var challenge = Uri.UnescapeDataString(link.Split('#')[1].Split('/')[1]);
        Assert.True((await privacy.ConfirmEmail(new(challenge), default)).IsSuccess);
        Assert.False((await privacy.ConfirmEmail(new(challenge), default)).IsSuccess);
        Assert.Equal(nextEmail, (await db.Users.AsNoTracking().SingleAsync(x => x.Id == user.Id)).Email);
        Assert.True(await db.Sessions.Where(x => x.UserId == user.Id).AllAsync(x => x.RevokedAt != null));
    }

    [Fact]
    public async Task Baseline_invitation_tracks_expiry_cooldown_acceptance_and_revocation()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider; var db = sp.GetRequiredService<FrameworkDb>();
        var manager = sp.GetRequiredService<UserManager<AppUser>>(); var accounts = sp.GetRequiredService<AccountService>();
        var user = new AppUser { Id = Guid.NewGuid(), Email = "invited@example.test", UserName = "invited@example.test", InvitationSentAt = _clock.Now, InvitationExpiresAt = _clock.Now.AddHours(2) };
        Assert.True((await manager.CreateAsync(user)).Succeeded); db.Profiles.Add(UserProfile.Create(user.Id, "Invited", "en-ZA", false)); await db.SaveChangesAsync();
        Assert.Equal("invitation.wait", (await accounts.Invitation(Guid.NewGuid(), new(user.Id), default)).Error!.Code);
        db.ChangeTracker.Clear(); _clock.Now = _clock.Now.AddHours(3);
        Assert.Equal(1, (await accounts.Invitations(1, null, "Expired", default)).Value!.Total);
        Assert.True((await accounts.Invitation(Guid.NewGuid(), new(user.Id), default)).IsSuccess);
        Assert.Equal(1, (await accounts.Invitations(1, "Invited", "Pending", default)).Value!.Total);
        var current = (await manager.FindByIdAsync(user.Id.ToString()))!;
        var confirmation = await manager.GenerateEmailConfirmationTokenAsync(current);
        Assert.True((await accounts.Confirm(new(user.Id, confirmation), default)).IsSuccess);
        var password = await manager.GeneratePasswordResetTokenAsync(current);
        Assert.True((await accounts.Reset(new(user.Id, password, "Test-only!Password942"), default)).IsSuccess);
        Assert.Equal(1, (await accounts.Invitations(1, null, "Accepted", default)).Value!.Total);
        Assert.False((await accounts.Invitation(Guid.NewGuid(), new(user.Id, true), default)).IsSuccess);
        var revoked = new AppUser { Id = Guid.NewGuid(), Email = "revoked@example.test", UserName = "revoked@example.test" };
        await manager.CreateAsync(revoked); db.Profiles.Add(UserProfile.Create(revoked.Id, "Revoked", "en-ZA", false)); await db.SaveChangesAsync();
        var oldToken = await manager.GenerateEmailConfirmationTokenAsync(revoked);
        Assert.True((await accounts.Invitation(Guid.NewGuid(), new(revoked.Id, true), default)).IsSuccess);
        Assert.False((await accounts.Confirm(new(revoked.Id, oldToken), default)).IsSuccess);
    }

    [Fact]
    public async Task Baseline_audit_filters_and_operations_report_real_state()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider; var user = await User(sp); var db = sp.GetRequiredService<FrameworkDb>();
        db.Audit.AddRange(new AuditEntry { ActorId = user.Id, SubjectId = user.Id, Action = "file.uploaded", At = _clock.Now }, new AuditEntry { Action = "other", At = _clock.Now });
        db.Outbox.Add(new() { Type = "email.requested.v1", CreatedAt = _clock.Now.AddMinutes(-6), AvailableAt = _clock.Now });
        db.JobRuns.Add(new() { Id = Guid.NewGuid(), State = "Failed", AvailableAt = _clock.Now }); await db.SaveChangesAsync();
        var audit = await sp.GetRequiredService<IAuditHistory>().List(new(Action: "file", ActorId: user.Id, SubjectId: user.Id, From: _clock.Now.AddMinutes(-1)), default);
        Assert.Single(audit.Items); Assert.Equal("Test administrator", audit.Items[0].ActorName);
        var dispatcher = sp.GetRequiredService<Dispatcher<AuditQuery, Page<AuditItem>>>(); Assert.Equal(ErrorKind.Forbidden, (await dispatcher.Send(new())).Error!.Kind);
        var overview = await sp.GetRequiredService<OperationsService>().Overview(default);
        Assert.Equal(1, overview.PendingMessages); Assert.Equal(1, overview.FailedJobs); Assert.True(overview.OldestMessageSeconds >= 360);
    }

    [Fact]
    public async Task Baseline_http_enforces_admin_permissions_and_browser_mutation_protection()
    {
        string email;
        await using (var scope = _services.CreateAsyncScope())
        {
            var user = await User(scope.ServiceProvider); email = user.Email!;
            await scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>().RemoveFromRoleAsync(user, "Administrator");
        }
        await using var factory = new ApiFactory(_configuration);
        using var client = factory.CreateClient(new() { BaseAddress = new Uri("https://localhost"), AllowAutoRedirect = false });
        var csrf = await client.GetFromJsonAsync<JsonElement>("/api/v1/auth/csrf");
        client.DefaultRequestHeaders.Add("Origin", "https://localhost"); client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        var login = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(email, "Test-only!Password942", "baseline-test")); Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        client.DefaultRequestHeaders.Authorization = new("Bearer", (await login.Content.ReadFromJsonAsync<AccessResponse>())!.AccessToken);
        foreach (var path in new[] { "audit", "invitations", "operations/overview", "privacy/requests" }) Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/v1/auth/" + path)).StatusCode);
        foreach (var path in new[] { "notifications", "files", "privacy" }) Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/auth/" + path)).StatusCode);
        client.DefaultRequestHeaders.Remove("X-CSRF-TOKEN");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync("/api/v1/auth/privacy/deletion", new { })).StatusCode);
    }
}
