using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    private const string Avatar = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

    [Fact]
    public async Task Profile_persists_optional_details_avatar_and_preferences_without_changing_security()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp); var other = await User(sp); var db = sp.GetRequiredService<FrameworkDb>();
        var service = sp.GetRequiredService<AccountService>(); var security = sp.GetRequiredService<SecurityService>();
        var before = await security.Profile(user.Id, default); var stamp = user.SecurityStamp;
        Assert.Equal("UTC", before.TimeZone); Assert.Null(before.FirstName); Assert.Null(before.AvatarDataUrl);
        Assert.Contains("Africa/Johannesburg", service.GetProfileOptions().TimeZones);
        var update = new UpdateProfileRequest("  Ada Lovelace  ", " Ada ", " Lovelace ", "+27821234567", "af-ZA", "Africa/Johannesburg", before.Version, Avatar);
        var result = await service.UpdateProfile(user.Id, update, default); Assert.True(result.IsSuccess);
        db.ChangeTracker.Clear();
        var after = await security.Profile(user.Id, default);
        Assert.Equal("Ada Lovelace", after.DisplayName); Assert.Equal("Ada", after.FirstName); Assert.Equal("Lovelace", after.LastName);
        Assert.Equal("+27821234567", after.PhoneNumber); Assert.Equal("af-ZA", after.Culture); Assert.Equal("Africa/Johannesburg", after.TimeZone);
        Assert.Equal("data:image/png;base64," + Avatar, after.AvatarDataUrl); Assert.NotEqual(before.Version, after.Version);
        var identity = await db.Users.SingleAsync(x => x.Id == user.Id);
        Assert.Equal(stamp, identity.SecurityStamp); Assert.False(identity.PhoneNumberConfirmed); Assert.Equal(before.MfaMethods, after.MfaMethods);
        Assert.Equal("Test administrator", (await security.Profile(other.Id, default)).DisplayName);
        Assert.Null((await security.Profile(other.Id, default)).AvatarDataUrl);
        Assert.Equal("concurrency.conflict", (await service.UpdateProfile(user.Id, update, default)).Error!.Code);
        Assert.True((await service.UpdateProfile(user.Id, update with { Version = after.Version, AvatarBase64 = null, FirstName = "", LastName = " ", PhoneNumber = "" }, default)).IsSuccess);
        db.ChangeTracker.Clear(); after = await security.Profile(user.Id, default);
        Assert.Null(after.FirstName); Assert.Null(after.LastName); Assert.Null(after.PhoneNumber); Assert.NotNull(after.AvatarDataUrl);
        Assert.True((await service.UpdateProfile(user.Id, update with { Version = after.Version, AvatarBase64 = null, RemoveAvatar = true }, default)).IsSuccess);
        Assert.False(await db.Set<UserAvatar>().AnyAsync(x => x.UserId == user.Id));
        Assert.True(await db.Audit.AnyAsync(x => x.SubjectId == user.Id && x.Action == "profile.updated"));
    }

    [Fact]
    public async Task Profile_rejects_invalid_input_without_partial_writes_and_erases_exported_details()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp); var reviewer = await User(sp); var db = sp.GetRequiredService<FrameworkDb>();
        var service = sp.GetRequiredService<AccountService>(); var security = sp.GetRequiredService<SecurityService>();
        var before = await security.Profile(user.Id, default);
        var valid = new UpdateProfileRequest("Ada", "First", "Last", "+27821234567", "en-ZA", "UTC", before.Version, Avatar);
        foreach (var invalid in new[] {
            valid with { DisplayName = " " }, valid with { DisplayName = new string('a', 121) },
            valid with { FirstName = new string('a', 101) }, valid with { LastName = new string('a', 101) },
            valid with { PhoneNumber = "0821234567" }, valid with { Culture = "xx" }, valid with { TimeZone = "Bad/Zone" },
            valid with { AvatarBase64 = "not base64" }, valid with { AvatarBase64 = Convert.ToBase64String("<svg/>"u8) },
            valid with { AvatarBase64 = new string('A', 349529) }, valid with { RemoveAvatar = true },
            valid with { AvatarBase64 = Avatar[..^8] + "AAAAAAAA" },
            valid with { AvatarBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQA2mP8/x8AAwMCAKtDFO0AAAAASUVORK5CYII=" }
        }) Assert.False((await service.UpdateProfile(user.Id, invalid, default)).IsSuccess);
        Assert.Equal(before.Version, (await security.Profile(user.Id, default)).Version);
        Assert.False(await db.Set<UserAvatar>().AnyAsync());
        Assert.True((await service.UpdateProfile(user.Id, valid, default)).IsSuccess);
        var privacy = sp.GetRequiredService<PrivacyService>();
        using var exported = JsonDocument.Parse(await privacy.Export(user.Id, default));
        Assert.Equal("First", exported.RootElement.GetProperty("profile").GetProperty("firstName").GetString());
        Assert.Equal("+27821234567", exported.RootElement.GetProperty("account").GetProperty("phoneNumber").GetString());
        Assert.Equal(Avatar, exported.RootElement.GetProperty("avatarPng").GetString());
        Assert.True((await privacy.RequestDeletion(user.Id, default)).IsSuccess);
        var deletion = (await privacy.Status(user.Id, default)).Request!;
        Assert.True((await privacy.Review(reviewer.Id, new(deletion.Id, true), default)).IsSuccess);
        db.ChangeTracker.Clear();
        var erased = await db.Profiles.IgnoreQueryFilters().SingleAsync(x => x.Id == user.Id);
        Assert.Null(erased.FirstName); Assert.Null(erased.LastName); Assert.Equal("UTC", erased.TimeZone);
        Assert.Null((await db.Users.SingleAsync(x => x.Id == user.Id)).PhoneNumber);
        Assert.False(await db.Set<UserAvatar>().AnyAsync(x => x.UserId == user.Id));
        Assert.False((await service.UpdateProfile(user.Id, valid with { Version = erased.Version }, default)).IsSuccess);
    }

    [Fact]
    public async Task Profile_HTTP_requires_authentication_and_csrf_and_updates_only_the_actor()
    {
        string email; Guid id; Guid otherId;
        await using (var scope = _services.CreateAsyncScope())
        {
            var user = await User(scope.ServiceProvider); email = user.Email!; id = user.Id;
            otherId = (await User(scope.ServiceProvider)).Id;
        }
        await using var factory = new ApiFactory(_configuration);
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost"), AllowAutoRedirect = false });
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/auth/profile/options")).StatusCode);
        var csrf = await client.GetFromJsonAsync<JsonElement>("/api/v1/auth/csrf");
        client.DefaultRequestHeaders.Add("Origin", "https://localhost");
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(email, "Test-only!Password942", "profile test"));
        var access = (await response.Content.ReadFromJsonAsync<AccessResponse>())!;
        client.DefaultRequestHeaders.Authorization = new("Bearer", access.AccessToken);
        var profile = (await client.GetFromJsonAsync<ProfileResponse>("/api/v1/auth/profile"))!;
        var request = new UpdateProfileRequest("Updated name", null, null, null, "en-ZA", "Africa/Johannesburg", profile.Version);
        client.DefaultRequestHeaders.Remove("X-CSRF-TOKEN");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync("/api/v1/auth/profile", request)).StatusCode);
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/v1/auth/profile", request)).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync("/api/v1/auth/profile", request)).StatusCode);
        profile = (await client.GetFromJsonAsync<ProfileResponse>("/api/v1/auth/profile"))!;
        Assert.Equal(id, profile.Id); Assert.Equal("Updated name", profile.DisplayName);
        Assert.Equal("Africa/Johannesburg", profile.TimeZone);
        var refreshed = await client.PostAsJsonAsync("/api/v1/auth/refresh", new { });
        Assert.Equal("Africa/Johannesburg", (await refreshed.Content.ReadFromJsonAsync<AccessResponse>())!.TimeZone);
        await using var check = _services.CreateAsyncScope();
        Assert.Equal("Test administrator", (await check.ServiceProvider.GetRequiredService<SecurityService>().Profile(otherId, default)).DisplayName);
    }
}
