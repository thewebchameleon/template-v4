using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Support;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Support_portal_isolates_requesters_notes_attachments_and_enforces_workflow_and_concurrency()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var owner = await User(sp); var stranger = await User(sp); var admin = await User(sp);
        var users = sp.GetRequiredService<UserManager<AppUser>>();
        await users.RemoveFromRoleAsync(owner, "Administrator"); await users.RemoveFromRoleAsync(stranger, "Administrator");
        var auth = sp.GetRequiredService<AuthService>();
        var ownerToken = await auth.CreateSession(owner, "support-owner", true, default);
        var strangerToken = await auth.CreateSession(stranger, "support-other", true, default);
        var adminToken = await auth.CreateSession(admin, "support-agent", true, default);
        await sp.GetRequiredService<FrameworkDb>().SaveChangesAsync();
        await using var factory = new ApiFactory(_configuration);
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost") });
        const string root = "/api/v1/auth/support";
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(root + "/")).StatusCode);
        var csrf = await client.GetFromJsonAsync<JsonElement>("/api/v1/auth/csrf");
        client.DefaultRequestHeaders.Add("Origin", "https://localhost");
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        client.DefaultRequestHeaders.Authorization = new("Bearer", ownerToken.Access.AccessToken);
        var options = (await client.GetFromJsonAsync<SupportOptions>(root + "/options"))!;
        Assert.False(options.Agent); Assert.Empty(options.Agents);
        var category = Assert.Single(options.Categories).Id;
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync(root + "/?queue=true")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync(root + "/", new CreateTicket(" ", "body", category))).StatusCode);
        client.DefaultRequestHeaders.Remove("X-CSRF-TOKEN");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync(root + "/", new CreateTicket("Help", "body", category))).StatusCode);
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        var response = await client.PostAsJsonAsync(root + "/", new CreateTicket("Cannot sign in", "Requester private description", category));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var id = await response.Content.ReadFromJsonAsync<Guid>();
        async Task<TicketDetail> Detail() => (await client.GetFromJsonAsync<TicketDetail>($"{root}/{id}"))!;
        var detail = await Detail();
        Assert.Equal("Open", detail.Ticket.Status);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync(root + "/reply", new ReplyTicket(id, "private", true, detail.Ticket.Version))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync(root + "/categories", new SaveSupportCategory(null, "Forbidden", true, Guid.Empty))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync(root + "/attachments", new AttachTicket(id, "evidence.txt", "evidence"u8.ToArray(), detail.Ticket.Version))).StatusCode);
        detail = await Detail(); var attachment = Assert.Single(detail.Attachments);
        Assert.Equal("evidence", await client.GetStringAsync($"{root}/{id}/attachments/{attachment.Id}"));
        client.DefaultRequestHeaders.Authorization = new("Bearer", strangerToken.Access.AccessToken);
        Assert.Empty((await client.GetFromJsonAsync<Page<TicketItem>>(root + "/"))!.Items);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"{root}/{id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"{root}/{id}/attachments/{attachment.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync(root + "/reply", new ReplyTicket(id, "intrusion", false, detail.Ticket.Version))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync(root + "/update", new UpdateTicket(id, "Open", "Normal", category, null, detail.Ticket.Version))).StatusCode);
        client.DefaultRequestHeaders.Authorization = new("Bearer", adminToken.Access.AccessToken);
        var update = new UpdateTicket(id, "WaitingOnRequester", "High", category, admin.Id, detail.Ticket.Version);
        var race = await Task.WhenAll(client.PostAsJsonAsync(root + "/update", update), client.PostAsJsonAsync(root + "/update", update));
        Assert.Single(race, r => r.StatusCode == HttpStatusCode.OK); Assert.Single(race, r => r.StatusCode == HttpStatusCode.Conflict);
        detail = await Detail();
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync(root + "/reply", new ReplyTicket(id, "Staff confidential note", true, detail.Ticket.Version))).StatusCode);
        Assert.Contains((await Detail()).Messages.Items, m => m.Internal && m.Body == "Staff confidential note");
        foreach (var sort in new[] { "subject", "requester", "category", "status", "priority", "assignee", "createdAt", "updatedAt" })
            foreach (var direction in new[] { "asc", "desc" })
                Assert.Single((await client.GetFromJsonAsync<Page<TicketItem>>($"{root}/?queue=true&sort={sort}&direction={direction}&pageSize=5"))!.Items);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync(root + "/?sort=invalid")).StatusCode);
        client.DefaultRequestHeaders.Authorization = new("Bearer", ownerToken.Access.AccessToken);
        detail = await Detail(); Assert.DoesNotContain(detail.Messages.Items, m => m.Internal);
        Assert.DoesNotContain("Staff confidential note", await client.GetStringAsync($"{root}/{id}"));
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync(root + "/reply", new ReplyTicket(id, "More information", false, detail.Ticket.Version))).StatusCode);
        detail = await Detail(); Assert.Equal("Open", detail.Ticket.Status);
        client.DefaultRequestHeaders.Authorization = new("Bearer", adminToken.Access.AccessToken);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync(root + "/update", new UpdateTicket(id, "Resolved", "High", category, admin.Id, detail.Ticket.Version))).StatusCode);
        client.DefaultRequestHeaders.Authorization = new("Bearer", ownerToken.Access.AccessToken);
        detail = await Detail();
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync(root + "/reply", new ReplyTicket(id, "Still broken", false, detail.Ticket.Version))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync(root + "/update", new UpdateTicket(id, "Open", "High", category, admin.Id, detail.Ticket.Version))).StatusCode);
        var export = await client.GetStringAsync("/api/v1/auth/privacy/export");
        Assert.Contains("Requester private description", export); Assert.DoesNotContain("Staff confidential note", export);
        await using var fresh = _services.CreateAsyncScope(); var db = fresh.ServiceProvider.GetRequiredService<FrameworkDb>();
        Assert.Contains(await db.Notifications.ToArrayAsync(), x => x.UserId == owner.Id && x.Kind == "notificationSupport" && x.Link == $"/support/{id}");
        var emails = await db.Outbox.Where(x => x.Type == "email.requested.v1").Select(x => x.Payload).ToArrayAsync();
        Assert.Contains(emails, x => JsonSerializer.Deserialize<EmailRequest>(x)!.Template == EmailTemplate.SupportTicket);
        Assert.DoesNotContain(emails, x => x.Contains("Staff confidential note"));
        Assert.DoesNotContain(await db.Audit.ToArrayAsync(), x => (x.ChangesJson ?? "").Contains("Staff confidential note"));
    }

    [Fact]
    public async Task Support_runtime_disable_preserves_data_and_privacy_erasure_still_runs()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var owner = await User(sp); var admin = await User(sp);
        await sp.GetRequiredService<UserManager<AppUser>>().RemoveFromRoleAsync(owner, "Administrator");
        var context = sp.GetRequiredService<BackgroundExecutionContext>(); context.ActorId = owner.Id;
        var options = (await sp.GetRequiredService<ISupportTickets>().Options("", default)).Value!;
        var id = (await sp.GetRequiredService<Dispatcher<CreateTicket, Guid>>().Send(new("Erase me", "Personal information", options.Categories[0].Id))).Value;
        var ticket = (await sp.GetRequiredService<ISupportTickets>().Get(new(id), default)).Value!.Ticket;
        Assert.True((await sp.GetRequiredService<Dispatcher<AttachTicket, Unit>>().Send(new(id, "private.txt", "private"u8.ToArray(), ticket.Version))).IsSuccess);
        context.ActorId = admin.Id; context.Permissions = Permissions.All.ToHashSet();
        var runtime = sp.GetRequiredService<IRuntimeModules>(); var original = (await runtime.Read(default)).Single(x => x.Id == "support");
        Assert.True((await sp.GetRequiredService<Dispatcher<SaveRuntimeModule, RuntimeModule>>().Send(new("support", false, original.Version))).IsSuccess);
        Assert.Equal(ErrorKind.NotFound, (await sp.GetRequiredService<ISupportTickets>().Get(new(id), default)).Error!.Kind);
        var db = sp.GetRequiredService<FrameworkDb>(); Assert.True(await db.Set<SupportTicketRow>().AnyAsync(x => x.Id == id));
        var disabled = (await runtime.Read(default)).Single(x => x.Id == "support");
        Assert.True((await sp.GetRequiredService<Dispatcher<SaveRuntimeModule, RuntimeModule>>().Send(new("support", true, disabled.Version))).IsSuccess);
        Assert.Equal("Personal information", (await sp.GetRequiredService<ISupportTickets>().Get(new(id), default)).Value!.Description);
        var enabled = (await runtime.Read(default)).Single(x => x.Id == "support");
        Assert.True((await sp.GetRequiredService<Dispatcher<SaveRuntimeModule, RuntimeModule>>().Send(new("support", false, enabled.Version))).IsSuccess);
        db.ChangeTracker.Clear();
        var privacy = sp.GetRequiredService<PrivacyService>();
        Assert.True((await privacy.RequestDeletion(owner.Id, default)).IsSuccess);
        var deletion = await db.DeletionRequests.SingleAsync(x => x.UserId == owner.Id);
        Assert.True((await privacy.Review(admin.Id, new(deletion.Id, true), default)).IsSuccess);
        Assert.False(await db.Set<SupportTicketRow>().AnyAsync(x => x.Id == id));
        Assert.False(await db.Set<SupportAttachmentRow>().AnyAsync(x => x.TicketId == id));
        Assert.False(await db.Set<SupportMessageRow>().AnyAsync(x => x.TicketId == id));
    }

    [Fact]
    public async Task Support_categories_delegated_agents_limits_and_runtime_http_gate_are_authoritative()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var admin = await User(sp); var agent = await User(sp);
        var users = sp.GetRequiredService<UserManager<AppUser>>();
        await users.RemoveFromRoleAsync(agent, "Administrator");
        var roles = sp.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var role = new IdentityRole<Guid>("Support agent") { Id = Guid.NewGuid() };
        Assert.True((await roles.CreateAsync(role)).Succeeded);
        Assert.True((await roles.AddClaimAsync(role, new("permission", Permissions.SupportAgent))).Succeeded);
        Assert.True((await users.AddToRoleAsync(agent, role.Name!)).Succeeded);
        var context = sp.GetRequiredService<BackgroundExecutionContext>(); context.ActorId = admin.Id; context.Permissions = Permissions.All.ToHashSet();
        var store = sp.GetRequiredService<ISupportTickets>();
        var original = Assert.Single((await store.Options("", default)).Value!.Categories);
        var categories = sp.GetRequiredService<Dispatcher<SaveSupportCategory, Unit>>();
        Assert.Equal("support.last_category", (await categories.Send(new(original.Id, original.Name, false, original.Version))).Error!.Code);
        Assert.True((await categories.Send(new(null, "Billing", true, Guid.Empty))).IsSuccess);
        Assert.True((await categories.Send(new(original.Id, original.Name, false, original.Version))).IsSuccess);
        var create = sp.GetRequiredService<Dispatcher<CreateTicket, Guid>>();
        Assert.Equal("support.category_invalid", (await create.Send(new("Invalid", "description", original.Id))).Error!.Code);
        var billing = (await store.Options("", default)).Value!.Categories.Single(x => x.Name == "Billing");
        var id = (await create.Send(new("Question", "description", billing.Id))).Value;
        var ticket = (await store.Get(new(id), default)).Value!.Ticket;
        var attachments = sp.GetRequiredService<Dispatcher<AttachTicket, Unit>>();
        foreach (var request in new[] { new AttachTicket(id, "../escape", [1], ticket.Version), new AttachTicket(id, "empty", [], ticket.Version), new AttachTicket(id, "oversize", new byte[5242881], ticket.Version) })
            Assert.Equal(ErrorKind.Validation, (await attachments.Send(request)).Error!.Kind);
        var db = sp.GetRequiredService<FrameworkDb>();
        db.AddRange(Enumerable.Range(0, 10).Select(n => new SupportAttachmentRow { TicketId = id, OwnerId = admin.Id, Name = $"{n}.txt", Content = [1], At = _clock.GetUtcNow() }));
        await db.SaveChangesAsync();
        Assert.Equal("support.attachment_limit", (await attachments.Send(new(id, "eleventh.txt", [1], ticket.Version))).Error!.Code);
        context.ActorId = agent.Id; context.Permissions = new HashSet<string> { Permissions.SupportAgent };
        Assert.True((await store.Options("", default)).Value!.Agent);
        Assert.False((await store.Options("", default)).Value!.Administrator);
        Assert.True((await store.Get(new(id), default)).IsSuccess);
        Assert.Equal(ErrorKind.Forbidden, (await categories.Send(new(null, "Denied", true, Guid.Empty))).Error!.Kind);
        agent = (await users.FindByIdAsync(agent.Id.ToString()))!;
        await users.RemoveFromRoleAsync(agent, role.Name!);
        Assert.Equal(ErrorKind.NotFound, (await store.Get(new(id), default)).Error!.Kind);
        context.ActorId = admin.Id; context.Permissions = Permissions.All.ToHashSet();
        admin = (await users.FindByIdAsync(admin.Id.ToString()))!;
        var token = await sp.GetRequiredService<AuthService>().CreateSession(admin, "support-module", true, default);
        await db.SaveChangesAsync();
        await using var factory = new ApiFactory(_configuration);
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost") });
        client.DefaultRequestHeaders.Authorization = new("Bearer", token.Access.AccessToken);
        var csrf = await client.GetFromJsonAsync<JsonElement>("/api/v1/auth/csrf");
        client.DefaultRequestHeaders.Add("Origin", "https://localhost"); client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        var module = (await sp.GetRequiredService<IRuntimeModules>().Read(default)).Single(x => x.Id == "support");
        Assert.True((await sp.GetRequiredService<Dispatcher<SaveRuntimeModule, RuntimeModule>>().Send(new("support", false, module.Version))).IsSuccess);
        Assert.False((await client.GetFromJsonAsync<Dictionary<string, bool>>("/api/v1/modules"))!["support"]);
        foreach (var path in new[] { "/", "/options", $"/{id}", $"/{id}/attachments/{Guid.NewGuid()}" })
            Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/v1/auth/support" + path)).StatusCode);
        const string root = "/api/v1/auth/support";
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync(root + "/", new CreateTicket("Blocked", "body", billing.Id))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync(root + "/reply", new ReplyTicket(id, "Blocked", false, ticket.Version))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync(root + "/update", new UpdateTicket(id, "Open", "Normal", billing.Id, null, ticket.Version))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync(root + "/categories", new SaveSupportCategory(null, "Blocked", true, Guid.Empty))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync(root + "/attachments", new AttachTicket(id, "blocked.txt", [1], ticket.Version))).StatusCode);
    }
}
