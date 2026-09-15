using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Module_review_http_password_proof_and_retained_workspace_selection()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var actor = await User(sp);
        var organisation = (await sp.GetRequiredService<ICustomers>().Create(actor.Id, new("Retained workspace"), default)).Value!.Id;
        var token = await sp.GetRequiredService<AuthService>().CreateSession(actor, "demo-review", true, default);
        await sp.GetRequiredService<FrameworkDb>().SaveChangesAsync();
        var config = new Dictionary<string, string?>(_configuration) { ["Modules:organisations"] = "false", ["Modules:crm"] = "false", ["Modules:invoicing"] = "false", ["Modules:billing"] = "false" };
        await using var baseline = new ApiFactory(_configuration);
        foreach (var module in baseline.Services.GetRequiredService<ModuleCatalog>().Definitions.Where(x => x.Category == "private"))
            config[$"Modules:{module.Id}"] = "false";
        await using var factory = new ApiFactory(config);
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost") });
        var csrf = await client.GetFromJsonAsync<JsonElement>("/api/v1/auth/csrf");
        client.DefaultRequestHeaders.Authorization = new("Bearer", token.Access.AccessToken);
        client.DefaultRequestHeaders.Add("Origin", "https://localhost");
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        var path = "/api/v1/auth/administration/modules/my-files/settings";
        var settings = (await client.GetFromJsonAsync<MyFilesModuleSettings>(path))!;
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync(path, new SaveMyFilesModuleSettings(true, false, settings.Version))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync(path, new SaveMyFilesModuleSettings(true, false, settings.Version, "incorrect"))).StatusCode);
        var enabled = await client.PostAsJsonAsync(path, new SaveMyFilesModuleSettings(true, false, settings.Version, "Test-only!Password942"));
        Assert.Equal(HttpStatusCode.OK, enabled.StatusCode);
        Assert.DoesNotContain("Password942", await enabled.Content.ReadAsStringAsync());
        Assert.Contains((await client.GetFromJsonAsync<CustomerHome>("/api/v1/auth/customers/"))!.Accounts, x => x.Id == organisation);
        Assert.True((await client.PostAsJsonAsync("/api/v1/auth/customers/current", new { organisationId = organisation })).IsSuccessStatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync("/api/v1/auth/customers/", new { name = "Blocked new organisation" })).StatusCode);
    }

    [Fact]
    public async Task Module_review_admitted_request_finishes_but_next_request_is_blocked_after_disable()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var actor = await User(sp); var context = sp.GetRequiredService<BackgroundExecutionContext>();
        context.ActorId = actor.Id; context.Permissions = Permissions.All.ToHashSet();
        var token = await sp.GetRequiredService<AuthService>().CreateSession(actor, "admission-review", true, default);
        await sp.GetRequiredService<FrameworkDb>().SaveChangesAsync();
        var admitted = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var release = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        await using var originalFactory = new ApiFactory(_configuration);
        await using var factory = originalFactory.WithWebHostBuilder(builder => builder.ConfigureTestServices(services =>
            services.AddScoped<ICapabilities>(provider => new PausedAdmission(
                provider.GetRequiredService<TemplateV4.ApiService.HttpCapabilities>(), admitted, release))));
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost") });
        client.DefaultRequestHeaders.Authorization = new("Bearer", token.Access.AccessToken);
        var request = client.GetAsync("/api/v1/auth/support/options");
        try
        {
            await admitted.Task.WaitAsync(TimeSpan.FromSeconds(20));
            var activation = (await sp.GetRequiredService<IModuleActivation>().Read(default)).Single(x => x.Id == ModuleIds.Support);
            Assert.True((await sp.GetRequiredService<Dispatcher<SaveModuleActivation, ModuleActivation>>().Send(new(activation.Id, false, activation.Version))).IsSuccess);
        }
        finally { release.TrySetResult(); }
        Assert.Equal(HttpStatusCode.OK, (await request).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/v1/auth/support/options")).StatusCode);
    }

    private sealed class PausedAdmission(ICapabilities inner, TaskCompletionSource admitted, TaskCompletionSource release) : ICapabilities
    {
        public Task<Dictionary<string, bool>> Read(CancellationToken ct) => inner.Read(ct);
        public async Task<bool> Enabled(string capability, CancellationToken ct)
        {
            var enabled = await inner.Enabled(capability, ct);
            if (enabled && capability == ModuleIds.Support) { admitted.TrySetResult(); await release.Task.WaitAsync(ct); }
            return enabled;
        }
    }

    [Fact]
    public async Task Module_review_demo_requires_password_and_attempts_survive_transaction_rollback()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var actor = await User(sp);
        var context = sp.GetRequiredService<BackgroundExecutionContext>(); context.ActorId = actor.Id; context.Permissions = Permissions.All.ToHashSet();
        var settings = sp.GetRequiredService<IMyFilesModuleSettings>();
        var original = await settings.Read(default);
        var dispatcher = sp.GetRequiredService<Dispatcher<SaveMyFilesModuleSettings, MyFilesModuleSettings>>();
        Assert.False((await dispatcher.Send(new(true, false, original.Version))).IsSuccess);
        for (var attempt = 0; attempt < 5; attempt++)
            Assert.False((await dispatcher.Send(new(true, false, original.Version, "incorrect"))).IsSuccess);
        Assert.False((await dispatcher.Send(new(true, false, original.Version, "Test-only!Password942"))).IsSuccess);
        Assert.Equal(original, await settings.Read(default));
        var db = sp.GetRequiredService<FrameworkDb>();
        Assert.Empty(await db.Audit.Where(x => x.Action == "module.my-files_demo_changed").ToArrayAsync());
        _clock.Now = _clock.Now.AddMinutes(16);
        var enabled = await dispatcher.Send(new(true, false, original.Version, "Test-only!Password942"));
        Assert.True(enabled.IsSuccess, enabled.Error?.Code);
        // Turning off the module does not hide/lock its destructive settings.
        var activation = (await sp.GetRequiredService<IModuleActivation>().Read(default)).Single(x => x.Id == ModuleIds.MyFiles);
        Assert.True((await sp.GetRequiredService<Dispatcher<SaveModuleActivation, ModuleActivation>>().Send(new(activation.Id, false, activation.Version))).IsSuccess);
        var disabled = await dispatcher.Send(new(false, false, enabled.Value!.Version));
        Assert.True(disabled.IsSuccess); Assert.False(disabled.Value!.DemoMode);
        var audits = await db.Audit.Where(x => x.Action == "module.my-files_demo_changed").ToArrayAsync();
        Assert.Equal(2, audits.Length);
        Assert.DoesNotContain("Password942", string.Join("", audits.Select(x => x.ChangesJson)));
        Assert.DoesNotContain("secret", new SaveMyFilesModuleSettings(true, false, Guid.NewGuid(), "secret").ToString());
    }

    [Fact]
    public async Task Module_review_financial_permissions_are_independent_and_require_live_membership()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var actor = await User(sp); var outsider = await User(sp);
        var organisation = (await sp.GetRequiredService<ICustomers>().Create(actor.Id, new("Permission review"), default)).Value!.Id;
        var users = sp.GetRequiredService<UserManager<AppUser>>();
        await users.RemoveFromRoleAsync(actor, "Administrator");
        var operations = sp.GetRequiredService<IOrganisationOperations>();
        Assert.True(await operations.Allowed(actor.Id, organisation, OrganisationOperation.Read, default));
        foreach (var operation in new[] { OrganisationOperation.Issue, OrganisationOperation.Settle, OrganisationOperation.Correct })
            Assert.False(await operations.Allowed(actor.Id, organisation, operation, default));
        var roles = sp.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var role = new IdentityRole<Guid>("Payment recorder") { Id = Guid.NewGuid() };
        Assert.True((await roles.CreateAsync(role)).Succeeded);
        Assert.True((await roles.AddClaimAsync(role, new("permission", Permissions.InvoiceSettle))).Succeeded);
        Assert.True((await users.AddToRoleAsync(actor, role.Name!)).Succeeded);
        Assert.True(await operations.Allowed(actor.Id, organisation, OrganisationOperation.Settle, default));
        Assert.False(await operations.Allowed(actor.Id, organisation, OrganisationOperation.Issue, default));
        Assert.False(await operations.Allowed(actor.Id, organisation, OrganisationOperation.Correct, default));
        Assert.False(await operations.Allowed(outsider.Id, organisation, OrganisationOperation.Settle, default));
        await users.RemoveFromRoleAsync(actor, role.Name!);
        Assert.False(await operations.Allowed(actor.Id, organisation, OrganisationOperation.Settle, default));
    }

    [Fact]
    public async Task Module_review_missing_runtime_state_is_visible_but_cannot_be_enabled()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var actor = await User(sp); sp.GetRequiredService<BackgroundExecutionContext>().ActorId = actor.Id;
        var db = sp.GetRequiredService<FrameworkDb>();
        await db.RuntimeModules.Where(x => x.Id == ModuleIds.Support).ExecuteDeleteAsync();
        var missing = (await sp.GetRequiredService<IModuleActivation>().Read(default)).Single(x => x.Id == ModuleIds.Support);
        Assert.False(missing.Initialized); Assert.False(missing.Available); Assert.False(missing.Enabled);
        Assert.False(await sp.GetRequiredService<ICapabilities>().Enabled(ModuleIds.Support, default));
        await using var transaction = await db.Database.BeginTransactionAsync();
        Assert.False((await sp.GetRequiredService<IModuleActivation>().Save(new(missing.Id, true, Guid.NewGuid()), default)).IsSuccess);
    }
}
