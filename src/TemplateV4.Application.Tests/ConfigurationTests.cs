using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Configuration_http_enforces_role_Csrf_validation_conflicts_and_persists_public_branding()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var admin = await User(sp); var delegated = await User(sp);
        var users = sp.GetRequiredService<UserManager<AppUser>>();
        await users.RemoveFromRoleAsync(delegated, "Administrator");
        var roles = sp.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var settingsRole = new IdentityRole<Guid>("Settings operator") { Id = Guid.NewGuid() };
        Assert.True((await roles.CreateAsync(settingsRole)).Succeeded);
        Assert.True((await roles.AddClaimAsync(settingsRole, new Claim("permission", Permissions.Settings))).Succeeded);
        Assert.True((await users.AddToRoleAsync(delegated, settingsRole.Name!)).Succeeded);
        var auth = sp.GetRequiredService<AuthService>();
        var adminToken = await auth.CreateSession(admin, "configuration-admin", true, default);
        var delegatedToken = await auth.CreateSession(delegated, "configuration-operator", true, default);
        await sp.GetRequiredService<FrameworkDb>().SaveChangesAsync();
        Assert.True(adminToken.Access.IsAdministrator);
        Assert.False(delegatedToken.Access.IsAdministrator);
        Assert.Contains(Permissions.Settings, delegatedToken.Access.Permissions);
        await using var factory = new ApiFactory(_configuration);
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost"), AllowAutoRedirect = false });
        const string path = "/api/v1/auth/configuration/appearance";
        const string publicPath = "/api/v1/auth/appearance";
        using var initial = await client.GetAsync(publicPath);
        Assert.True(initial.Headers.CacheControl!.NoStore);
        var publicJson = (await initial.Content.ReadFromJsonAsync<JsonElement>());
        Assert.Single(publicJson.EnumerateObject());
        Assert.Equal("#2563EB", publicJson.GetProperty("primaryColor").GetString());
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(path)).StatusCode);
        client.DefaultRequestHeaders.Authorization = new("Bearer", delegatedToken.Access.AccessToken);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync(path)).StatusCode);
        var csrf = await client.GetFromJsonAsync<JsonElement>("/api/v1/auth/csrf");
        client.DefaultRequestHeaders.Add("Origin", "https://localhost");
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync(path, new SavePlatformAppearance("#7C3AED", Guid.NewGuid()))).StatusCode);
        client.DefaultRequestHeaders.Authorization = new("Bearer", adminToken.Access.AccessToken);
        var original = (await client.GetFromJsonAsync<PlatformAppearance>(path))!;
        foreach (var invalid in new[] { "", "#FFF", "#GGGGGG", "red", "#1234567", "#123456;", " #2563EB", null })
            Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync(path, new SavePlatformAppearance(invalid!, original.Version))).StatusCode);
        client.DefaultRequestHeaders.Remove("X-CSRF-TOKEN");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync(path, new SavePlatformAppearance("#7C3AED", original.Version))).StatusCode);
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());

        var attempts = await Task.WhenAll(
            client.PostAsJsonAsync(path, new SavePlatformAppearance("#7c3aed", original.Version)),
            client.PostAsJsonAsync(path, new SavePlatformAppearance("#e11d48", original.Version)));
        Assert.Single(attempts, x => x.StatusCode == HttpStatusCode.OK);
        Assert.Single(attempts, x => x.StatusCode == HttpStatusCode.Conflict);
        var saved = (await attempts.Single(x => x.IsSuccessStatusCode).Content.ReadFromJsonAsync<PlatformAppearance>())!;
        Assert.NotEqual(original.Version, saved.Version);
        Assert.Equal(saved.PrimaryColor.ToUpperInvariant(), saved.PrimaryColor);
        Assert.Equal(saved, await client.GetFromJsonAsync<PlatformAppearance>(path));
        await using var fresh = _services.CreateAsyncScope();
        var db = fresh.ServiceProvider.GetRequiredService<FrameworkDb>();
        Assert.Equal(saved.PrimaryColor, (await db.PlatformAppearanceSettings.SingleAsync()).PrimaryColor);
        var audit = Assert.Single(await db.Audit.Where(x => x.Action == "configuration.appearance_changed").ToArrayAsync());
        Assert.Equal(admin.Id, audit.ActorId);
        client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(saved.PrimaryColor, (await client.GetFromJsonAsync<PublicAppearance>(publicPath))!.PrimaryColor);
        client.DefaultRequestHeaders.Authorization = new("Bearer", adminToken.Access.AccessToken);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync(path, new SavePlatformAppearance("#2563EB", saved.Version))).StatusCode);
        Assert.Equal("#2563EB", (await client.GetFromJsonAsync<PublicAppearance>(publicPath))!.PrimaryColor);
        foreach (var response in attempts) response.Dispose();
    }

    [Fact]
    public async Task Configuration_dispatcher_denies_non_administrators_even_with_settings_permission()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp);
        await sp.GetRequiredService<UserManager<AppUser>>().RemoveFromRoleAsync(user, "Administrator");
        var context = sp.GetRequiredService<BackgroundExecutionContext>();
        context.ActorId = user.Id; context.Permissions = new HashSet<string> { Permissions.Settings };
        var store = sp.GetRequiredService<IPlatformAppearance>();
        var original = await store.Read(default);
        var result = await sp.GetRequiredService<Dispatcher<SavePlatformAppearance, PlatformAppearance>>()
            .Send(new("#059669", original.Version));
        Assert.Equal(ErrorKind.Forbidden, result.Error!.Kind);
        Assert.Equal(original, await store.Read(default));
        Assert.Empty(await sp.GetRequiredService<FrameworkDb>().Audit.Where(x => x.Action == "configuration.appearance_changed").ToArrayAsync());
    }

    [Fact]
    public async Task Configuration_custom_palette_is_shared_versioned_validated_and_removal_restores_blue()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var admin = await User(sp);
        var context = sp.GetRequiredService<BackgroundExecutionContext>();
        context.ActorId = admin.Id; context.Permissions = new HashSet<string> { Permissions.Settings };
        var dispatcher = sp.GetRequiredService<Dispatcher<SavePlatformAppearance, PlatformAppearance>>();
        var store = sp.GetRequiredService<IPlatformAppearance>();
        var initial = await store.Read(default);
        var first = new CustomBrandColor(Guid.NewGuid(), "  Ocean  ", "#0891b2");
        var second = new CustomBrandColor(Guid.NewGuid(), "Orchid", "#c026d3");
        var added = (await dispatcher.Send(new("#2563EB", initial.Version, [first, second], first.Id))).Value!;
        Assert.Equal("#0891B2", added.PrimaryColor);
        Assert.Equal("Ocean", added.CustomColors[0].Name);
        Assert.Equal(first.Id, added.SelectedCustomColorId);
        await using (var otherScope = _services.CreateAsyncScope())
        {
            var shared = await otherScope.ServiceProvider.GetRequiredService<IPlatformAppearance>().Read(default);
            Assert.Equal(added.CustomColors, shared.CustomColors);
            Assert.Equal(added.SelectedCustomColorId, shared.SelectedCustomColorId);
        }
        Assert.Equal(ErrorKind.Conflict, (await dispatcher.Send(new("#E11D48", initial.Version, []))).Error!.Kind);
        var invalidPalettes = new CustomBrandColor[][] {
            [first, second with { Name = "oCeAn" }], [first, second with { Id = first.Id }],
            [first with { Name = " " }], [first with { Name = new string('x', 41) }],
            [first with { Name = "Bad\nName" }], [first with { Color = "#GGGGGG" }],
            [first with { Id = Guid.Empty }], [null!],
            Enumerable.Range(0, 25).Select(i => new CustomBrandColor(Guid.NewGuid(), $"Color {i}", "#2563EB")).ToArray()
        };
        foreach (var invalid in invalidPalettes)
            Assert.Equal(ErrorKind.Validation, (await dispatcher.Send(new("#2563EB", added.Version, invalid))).Error!.Kind);
        var untouched = await store.Read(default);
        Assert.Equal(added.Version, untouched.Version);
        Assert.Equal(added.CustomColors, untouched.CustomColors);
        var renamed = (await dispatcher.Send(new(added.PrimaryColor, added.Version,
            [first with { Name = "Lagoon", Color = "#0d9488" }, second], first.Id))).Value!;
        Assert.Equal("Lagoon", renamed.CustomColors[0].Name);
        Assert.Equal("#0D9488", renamed.PrimaryColor);
        // Older clients may omit the palette; it must not erase shared custom colors.
        var compatible = (await dispatcher.Send(new("#4F46E5", renamed.Version))).Value!;
        Assert.Equal(renamed.CustomColors, compatible.CustomColors);
        var selected = (await dispatcher.Send(new("#2563EB", compatible.Version, compatible.CustomColors, first.Id))).Value!;
        var removed = (await dispatcher.Send(new(selected.PrimaryColor, selected.Version, [second], first.Id))).Value!;
        Assert.Equal("#2563EB", removed.PrimaryColor);
        Assert.Null(removed.SelectedCustomColorId);
        Assert.Equal(second.Id, Assert.Single(removed.CustomColors).Id);
        var db = sp.GetRequiredService<FrameworkDb>();
        Assert.Equal(5, await db.Audit.CountAsync(x => x.Action == "configuration.appearance_changed"));
    }
}
