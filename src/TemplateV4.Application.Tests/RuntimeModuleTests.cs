using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using TemplateV4.Infrastructure.Storage;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Runtime_modules_http_enforces_roles_Csrf_validation_and_concurrent_saves()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var admin = await User(sp); var delegated = await User(sp); var reader = await User(sp);
        var users = sp.GetRequiredService<UserManager<AppUser>>();
        await users.RemoveFromRoleAsync(delegated, "Administrator");
        await users.RemoveFromRoleAsync(reader, "Administrator");
        var roles = sp.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var role = new IdentityRole<Guid>("Module settings operator") { Id = Guid.NewGuid() };
        Assert.True((await roles.CreateAsync(role)).Succeeded);
        Assert.True((await roles.AddClaimAsync(role, new Claim("permission", Permissions.Settings))).Succeeded);
        Assert.True((await users.AddToRoleAsync(delegated, role.Name!)).Succeeded);
        var auth = sp.GetRequiredService<AuthService>();
        var adminToken = await auth.CreateSession(admin, "module-admin", true, default);
        var delegatedToken = await auth.CreateSession(delegated, "module-delegated", true, default);
        var readerToken = await auth.CreateSession(reader, "module-reader", true, default);
        await sp.GetRequiredService<FrameworkDb>().SaveChangesAsync();
        await using var factory = new ApiFactory(_configuration);
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost"), AllowAutoRedirect = false });
        const string path = "/api/v1/auth/administration/modules";
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(path)).StatusCode);
        var csrf = await client.GetFromJsonAsync<JsonElement>("/api/v1/auth/csrf");
        client.DefaultRequestHeaders.Add("Origin", "https://localhost");
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        foreach (var token in new[] { delegatedToken, readerToken })
        {
            client.DefaultRequestHeaders.Authorization = new("Bearer", token.Access.AccessToken);
            Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync(path)).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync(path, new SaveRuntimeModule("files", false, Guid.NewGuid()))).StatusCode);
        }
        client.DefaultRequestHeaders.Authorization = new("Bearer", adminToken.Access.AccessToken);
        var original = Assert.Single((await client.GetFromJsonAsync<RuntimeModule[]>(path))!);
        Assert.Equal("files", original.Id); Assert.True(original.Enabled); Assert.True(original.Available);
        foreach (var request in new[] { new SaveRuntimeModule("unknown", false, original.Version), new SaveRuntimeModule("files", false, Guid.Empty) })
            Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync(path, request)).StatusCode);
        client.DefaultRequestHeaders.Remove("X-CSRF-TOKEN");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync(path, new SaveRuntimeModule("files", false, original.Version))).StatusCode);
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        var attempts = await Task.WhenAll(
            client.PostAsJsonAsync(path, new SaveRuntimeModule("files", false, original.Version)),
            client.PostAsJsonAsync(path, new SaveRuntimeModule("files", false, original.Version)));
        Assert.Single(attempts, x => x.StatusCode == HttpStatusCode.OK);
        Assert.Single(attempts, x => x.StatusCode == HttpStatusCode.Conflict);
        var saved = (await attempts.Single(x => x.IsSuccessStatusCode).Content.ReadFromJsonAsync<RuntimeModule>())!;
        Assert.False(saved.Enabled); Assert.NotEqual(original.Version, saved.Version);
        await using var fresh = _services.CreateAsyncScope();
        Assert.Equal(saved, Assert.Single(await fresh.ServiceProvider.GetRequiredService<IRuntimeModules>().Read(default)));
        var audit = Assert.Single(await fresh.ServiceProvider.GetRequiredService<FrameworkDb>().Audit.Where(x => x.Action.StartsWith("module.")).ToArrayAsync());
        Assert.Equal("module.files_disabled", audit.Action); Assert.Equal(admin.Id, audit.ActorId);
        foreach (var response in attempts) response.Dispose();
    }

    [Fact]
    public async Task Runtime_modules_disable_all_file_endpoints_across_instances_and_preserve_content()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var admin = await User(sp); var owner = await User(sp);
        await sp.GetRequiredService<UserManager<AppUser>>().RemoveFromRoleAsync(owner, "Administrator");
        var auth = sp.GetRequiredService<AuthService>();
        var adminToken = await auth.CreateSession(admin, "module-admin", true, default);
        var ownerToken = await auth.CreateSession(owner, "module-owner", true, default);
        await sp.GetRequiredService<FrameworkDb>().SaveChangesAsync();
        using var bytes = new MemoryStream("preserved content"u8.ToArray());
        var file = (await sp.GetRequiredService<FileService>().Upload(owner.Id, "original.txt", bytes, default)).Value!;
        var config = new Dictionary<string, string?>(_configuration) { ["Storage:Path"] = Path.Combine(_directory, "files"), ["Features:files:Enabled"] = "true", [$"Features:files:Users:{owner.Id}"] = "true" };
        await using var first = new ApiFactory(config); await using var second = new ApiFactory(config);
        using var writer = first.CreateClient(new() { BaseAddress = new("https://localhost") });
        using var observer = second.CreateClient(new() { BaseAddress = new("https://localhost") });
        const string modulePath = "/api/v1/auth/administration/modules";
        const string files = "/api/v1/auth/files";
        writer.DefaultRequestHeaders.Authorization = new("Bearer", adminToken.Access.AccessToken);
        observer.DefaultRequestHeaders.Authorization = new("Bearer", adminToken.Access.AccessToken);
        foreach (var client in new[] { writer, observer })
        {
            var csrf = await client.GetFromJsonAsync<JsonElement>("/api/v1/auth/csrf");
            client.DefaultRequestHeaders.Add("Origin", "https://localhost");
            client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        }
        var original = Assert.Single((await writer.GetFromJsonAsync<RuntimeModule[]>(modulePath))!);
        Assert.True((await observer.GetFromJsonAsync<Dictionary<string, bool>>("/api/v1/features"))!["files"]);
        using var disabledResponse = await writer.PostAsJsonAsync(modulePath, new SaveRuntimeModule("files", false, original.Version));
        Assert.Equal(HttpStatusCode.OK, disabledResponse.StatusCode);
        var disabled = (await disabledResponse.Content.ReadFromJsonAsync<RuntimeModule>())!;
        Assert.False((await observer.GetFromJsonAsync<Dictionary<string, bool>>("/api/v1/modules"))!["files"]);
        foreach (var token in new[] { adminToken, ownerToken })
        {
            observer.DefaultRequestHeaders.Authorization = new("Bearer", token.Access.AccessToken);
            Assert.False((await observer.GetFromJsonAsync<Dictionary<string, bool>>("/api/v1/features"))!["files"]);
            Assert.Equal(HttpStatusCode.NotFound, (await observer.GetAsync(files)).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await observer.GetAsync($"{files}/{file.Id}/download")).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await observer.PostAsJsonAsync($"{files}/{file.Id}/delete", new { })).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await observer.PostAsJsonAsync($"{files}/{file.Id}/rename", new FileNameRequest("renamed.txt"))).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await observer.PostAsJsonAsync(files + "/folders", new CreateFolderRequest("blocked"))).StatusCode);
            using var upload = new ByteArrayContent("blocked"u8.ToArray());
            upload.Headers.ContentType = new("application/octet-stream");
            Assert.Equal(HttpStatusCode.NotFound, (await observer.PostAsync(files + "/upload?name=blocked.txt", upload)).StatusCode);
        }
        observer.DefaultRequestHeaders.Authorization = new("Bearer", adminToken.Access.AccessToken);
        var ownerPath = $"{files}/admin/users/{owner.Id}";
        foreach (var path in new[] { files + "/admin/settings", ownerPath, $"{ownerPath}/{file.Id}/download" })
            Assert.Equal(HttpStatusCode.NotFound, (await observer.GetAsync(path)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await observer.PostAsJsonAsync(ownerPath + "/quota", new FileQuotaRequest(0))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await observer.PostAsJsonAsync(files + "/admin/settings", new StorageSettingsRequest(0, Guid.NewGuid()))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await writer.PostAsJsonAsync(modulePath, new SaveRuntimeModule("files", true, disabled.Version))).StatusCode);
        observer.DefaultRequestHeaders.Authorization = new("Bearer", ownerToken.Access.AccessToken);
        Assert.True((await observer.GetFromJsonAsync<Dictionary<string, bool>>("/api/v1/features"))!["files"]);
        Assert.Equal("preserved content", await observer.GetStringAsync($"{files}/{file.Id}/download"));
        var listing = (await observer.GetFromJsonAsync<FilePage>(files))!;
        Assert.Equal("original.txt", Assert.Single(listing.Page.Items).Name);
        Assert.Equal(100L * 1024 * 1024, listing.QuotaBytes);
        await using var fresh = _services.CreateAsyncScope();
        var db = fresh.ServiceProvider.GetRequiredService<FrameworkDb>();
        Assert.Null((await db.Files.SingleAsync(x => x.Id == file.Id)).DeletedAt);
        Assert.Equal(2, await db.Audit.CountAsync(x => x.Action.StartsWith("module.")));
    }

    [Fact]
    public async Task Runtime_modules_dispatcher_checks_current_role_and_deployment_restrictions()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var actor = await User(sp);
        var context = sp.GetRequiredService<BackgroundExecutionContext>();
        context.ActorId = actor.Id; context.Permissions = new HashSet<string> { Permissions.Settings };
        var modules = sp.GetRequiredService<IRuntimeModules>();
        var original = Assert.Single(await modules.Read(default));
        await sp.GetRequiredService<UserManager<AppUser>>().RemoveFromRoleAsync(actor, "Administrator");
        var dispatcher = sp.GetRequiredService<Dispatcher<SaveRuntimeModule, RuntimeModule>>();
        Assert.Equal(ErrorKind.Forbidden, (await dispatcher.Send(new("files", false, original.Version))).Error!.Kind);
        Assert.Equal(original, Assert.Single(await modules.Read(default)));
        Assert.Empty(await sp.GetRequiredService<FrameworkDb>().Audit.Where(x => x.Action.StartsWith("module.")).ToArrayAsync());

        actor = (await sp.GetRequiredService<UserManager<AppUser>>().FindByIdAsync(actor.Id.ToString()))!;
        await sp.GetRequiredService<UserManager<AppUser>>().AddToRoleAsync(actor, "Administrator");
        var token = await sp.GetRequiredService<AuthService>().CreateSession(actor, "deployment-admin", true, default);
        await sp.GetRequiredService<FrameworkDb>().SaveChangesAsync();
        await using var factory = new ApiFactory(new Dictionary<string, string?>(_configuration) { ["Modules:files"] = "false" });
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost") });
        client.DefaultRequestHeaders.Authorization = new("Bearer", token.Access.AccessToken);
        const string path = "/api/v1/auth/administration/modules";
        Assert.False(Assert.Single((await client.GetFromJsonAsync<RuntimeModule[]>(path))!).Available);
        var csrf = await client.GetFromJsonAsync<JsonElement>("/api/v1/auth/csrf");
        client.DefaultRequestHeaders.Add("Origin", "https://localhost");
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync(path, new SaveRuntimeModule("files", true, original.Version))).StatusCode);
        Assert.False((await client.GetFromJsonAsync<Dictionary<string, bool>>("/api/v1/modules"))!["files"]);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/v1/auth/files")).StatusCode);
    }
}
