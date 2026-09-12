using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using TemplateV4.Infrastructure.Storage;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task File_library_folders_enforce_ownership_parent_type_and_empty_deletion()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var owner = await User(sp); var other = await User(sp); var service = sp.GetRequiredService<FileService>();
        var folder = (await service.CreateFolder(owner.Id, new("Folder"), default)).Value!;
        var child = (await service.CreateFolder(owner.Id, new("Child", folder.Id), default)).Value!;
        Assert.True(folder.IsFolder);
        Assert.Equal(ErrorKind.NotFound, (await service.CreateFolder(other.Id, new("Other", folder.Id), default)).Error!.Kind);
        Assert.Equal(ErrorKind.NotFound, (await service.List(other.Id, 1, 10, null, "name", "asc", default, folder.Id)).Error!.Kind);
        using var content = new MemoryStream(new byte[] { 0, 1, 255, 0, 7 });
        var file = (await service.Upload(owner.Id, "data.unknown", content, default, child.Id)).Value!;
        Assert.Equal(child.Id, file.ParentId);
        content.Position = 0;
        Assert.Equal(ErrorKind.NotFound, (await service.Upload(other.Id, "bad.bin", content, default, child.Id)).Error!.Kind);
        Assert.Equal(ErrorKind.NotFound, (await service.CreateFolder(owner.Id, new("Not a folder", file.Id), default)).Error!.Kind);
        Assert.Equal("files.folder_not_empty", (await service.Delete(owner.Id, child.Id, default)).Error!.Code);
        Assert.False((await service.Download(owner.Id, folder.Id, default)).IsSuccess);
        Assert.False((await service.Rename(other.Id, file.Id, new("stolen.bin"), default)).IsSuccess);
        Assert.True((await service.Rename(owner.Id, file.Id, new("renamed.exe"), default)).IsSuccess);
        Assert.True((await service.Rename(owner.Id, child.Id, new("Renamed child"), default)).IsSuccess);
        var listed = (await service.List(owner.Id, 1, 1, "renamed", "name", "asc", default, child.Id)).Value!;
        Assert.Equal("Renamed child", listed.Folder!.Name);
        Assert.Equal("renamed.exe", Assert.Single(listed.Page.Items).Name);
        Assert.Equal(5, listed.UsedBytes);
        var downloaded = (await service.Download(owner.Id, file.Id, default)).Value!;
        await using (downloaded.Content)
        {
            using var bytes = new MemoryStream(); await downloaded.Content.CopyToAsync(bytes);
            Assert.Equal(new byte[] { 0, 1, 255, 0, 7 }, bytes.ToArray());
        }
        Assert.Equal("renamed.exe", downloaded.Name);
        Assert.True((await service.Delete(owner.Id, file.Id, default)).IsSuccess);
        Assert.True((await service.Delete(owner.Id, child.Id, default)).IsSuccess);
        Assert.True((await service.Delete(owner.Id, folder.Id, default)).IsSuccess);
        Assert.Equal(0, (await service.List(owner.Id, 1, 10, null, "name", "asc", default)).Value!.Page.Total);
        Assert.Equal(5, (await service.List(owner.Id, 1, 10, null, "name", "asc", default)).Value!.UsedBytes);
    }

    [Fact]
    public async Task File_library_quotas_inherit_override_reset_and_preserve_files_after_reduction()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var owner = await User(sp); var other = await User(sp); var service = sp.GetRequiredService<FileService>();
        var settings = await service.Settings(default);
        Assert.Equal(100L * 1024 * 1024, settings.DefaultQuotaBytes);
        Assert.True((await service.SaveSettings(other.Id, new(10, settings.Version), default)).IsSuccess);
        Assert.Equal("files.settings_conflict", (await service.SaveSettings(other.Id, new(30, settings.Version), default)).Error!.Code);
        Assert.True((await service.SetQuota(other.Id, owner.Id, new(15), default)).IsSuccess);
        using var content = new MemoryStream(new byte[12]);
        var uploaded = (await service.Upload(owner.Id, "content.bin", content, default)).Value!;
        content.Position = 0;
        Assert.Equal("files.quota", (await service.Upload(other.Id, "too-big.bin", content, default)).Error!.Code);
        Assert.True((await service.SetQuota(other.Id, owner.Id, new(null), default)).IsSuccess);
        var listed = (await service.List(owner.Id, 1, 10, null, "name", "asc", default)).Value!;
        Assert.Null(listed.QuotaOverrideBytes); Assert.Equal(10, listed.QuotaBytes); Assert.Equal(12, listed.UsedBytes);
        using var extra = new MemoryStream(new byte[] { 1 });
        Assert.Equal("files.quota", (await service.Upload(owner.Id, "extra.bin", extra, default)).Error!.Code);
        var existing = await service.Download(owner.Id, uploaded.Id, default);
        Assert.True(existing.IsSuccess); await existing.Value!.Content.DisposeAsync();
        Assert.True((await service.SetQuota(other.Id, owner.Id, new(0), default)).IsSuccess);
        using var empty = new MemoryStream();
        Assert.Equal("files.quota", (await service.Upload(owner.Id, "empty", empty, default)).Error!.Code);
        Assert.False((await service.SetQuota(other.Id, owner.Id, new(-1), default)).IsSuccess);
        Assert.False((await service.SetQuota(other.Id, owner.Id, new(FileService.MaximumQuotaBytes + 1), default)).IsSuccess);
        var updated = await service.Settings(default);
        Assert.True((await service.SaveSettings(other.Id, new(40, updated.Version), default)).IsSuccess);
        Assert.True((await service.SetQuota(other.Id, owner.Id, new(null), default)).IsSuccess);
        Assert.Equal(40, (await service.List(owner.Id, 1, 10, null, "name", "asc", default)).Value!.QuotaBytes);
        var future = await User(sp);
        Assert.Equal(40, (await service.List(future.Id, 1, 10, null, "name", "asc", default)).Value!.QuotaBytes);
    }

    [Fact]
    public async Task File_library_concurrent_uploads_reserve_within_one_users_quota()
    {
        Guid owner;
        await using (var scope = _services.CreateAsyncScope())
        {
            owner = (await User(scope.ServiceProvider)).Id;
            Assert.True((await scope.ServiceProvider.GetRequiredService<FileService>().SetQuota(owner, owner, new(10), default)).IsSuccess);
        }
        async Task<Result<FileItem>> Upload()
        {
            await using var scope = _services.CreateAsyncScope();
            using var content = new MemoryStream(new byte[6]);
            return await scope.ServiceProvider.GetRequiredService<FileService>().Upload(owner, "concurrent.bin", content, default);
        }
        var results = await Task.WhenAll(Upload(), Upload());
        Assert.Single(results, x => x.IsSuccess);
        Assert.Equal("files.quota", Assert.Single(results, x => !x.IsSuccess).Error!.Code);
        await using var check = _services.CreateAsyncScope();
        Assert.Equal(6, await check.ServiceProvider.GetRequiredService<FrameworkDb>().Files.Where(x => x.OwnerId == owner).SumAsync(x => x.Size));
    }

    [Fact]
    public async Task File_library_bounds_raw_uploads_and_validates_names_without_type_restrictions()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var owner = await User(sp); var service = sp.GetRequiredService<FileService>();
        using var empty = new MemoryStream();
        foreach (var name in new[] { "", " ", ".", "..", "a/b", "a\\b", "a\nb", new string('a', 181) })
            Assert.Equal("files.invalid_name", (await service.Upload(owner.Id, name, empty, default)).Error!.Code);
        Assert.True((await service.Upload(owner.Id, "empty", empty, default)).IsSuccess);
        using var exact = new MemoryStream(new byte[FileService.MaxUploadBytes]);
        Assert.True((await service.Upload(owner.Id, "limit.zip", exact, default)).IsSuccess);
        using var oversized = new MemoryStream(new byte[FileService.MaxUploadBytes + 1]);
        Assert.Equal("files.too_large", (await service.Upload(owner.Id, "oversized.zip", oversized, default)).Error!.Code);
        Assert.Equal(2, await sp.GetRequiredService<FrameworkDb>().Files.CountAsync());
    }

    [Fact]
    public async Task File_library_http_admin_access_is_permission_gated_and_downloads_are_attachments()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var admin = await User(sp); var reader = await User(sp); var other = await User(sp);
        await sp.GetRequiredService<UserManager<AppUser>>().RemoveFromRoleAsync(reader, "Administrator");
        var auth = sp.GetRequiredService<AuthService>();
        var adminToken = await auth.CreateSession(admin, "files-admin", true, default);
        var readerToken = await auth.CreateSession(reader, "files-reader", true, default);
        using var content = new MemoryStream("<script>alert(1)</script>"u8.ToArray());
        var file = (await sp.GetRequiredService<FileService>().Upload(other.Id, "content.html", content, default)).Value!;
        var config = new Dictionary<string, string?>(_configuration) { ["Storage:Path"] = Path.Combine(_directory, "files"), ["Features:files:Enabled"] = "true" };
        await using var factory = new ApiFactory(config);
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost"), AllowAutoRedirect = false });
        var csrf = await client.GetFromJsonAsync<JsonElement>("/api/v1/auth/csrf");
        client.DefaultRequestHeaders.Add("Origin", "https://localhost");
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        client.DefaultRequestHeaders.Authorization = new("Bearer", readerToken.Access.AccessToken);
        var adminPath = $"/api/v1/auth/files/admin/users/{other.Id}";
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/auth/files")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/v1/auth/files/{file.Id}/download")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync(adminPath)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync($"{adminPath}/{file.Id}/download")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/v1/auth/files/admin/settings")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync(adminPath + "/quota", new FileQuotaRequest(50))).StatusCode);
        client.DefaultRequestHeaders.Authorization = new("Bearer", adminToken.Access.AccessToken);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync(adminPath)).StatusCode);
        using var download = await client.GetAsync($"{adminPath}/{file.Id}/download");
        Assert.Equal(HttpStatusCode.OK, download.StatusCode);
        Assert.Equal("attachment", download.Content.Headers.ContentDisposition!.DispositionType);
        Assert.Equal("application/octet-stream", download.Content.Headers.ContentType!.MediaType);
        Assert.Contains("nosniff", download.Headers.GetValues("X-Content-Type-Options"));
        Assert.Equal("<script>alert(1)</script>", await download.Content.ReadAsStringAsync());
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/v1/auth/files/admin/users/{reader.Id}/{file.Id}/download")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync(adminPath + "/quota", new FileQuotaRequest(50))).StatusCode);
        Assert.Equal(50, (await client.GetFromJsonAsync<FilePage>(adminPath))!.QuotaBytes);
        Assert.Contains(await sp.GetRequiredService<FrameworkDb>().Audit.ToArrayAsync(), x => x.ActorId == admin.Id && x.SubjectId == file.Id && x.Action == "file.admin_downloaded");
        client.DefaultRequestHeaders.Remove("X-CSRF-TOKEN");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync(adminPath + "/quota", new FileQuotaRequest(100))).StatusCode);
        config["Features:files:Enabled"] = "false";
        await using var disabled = new ApiFactory(config);
        using var disabledClient = disabled.CreateClient(new() { BaseAddress = new("https://localhost") });
        disabledClient.DefaultRequestHeaders.Authorization = new("Bearer", adminToken.Access.AccessToken);
        Assert.Equal(HttpStatusCode.NotFound, (await disabledClient.GetAsync(adminPath)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await disabledClient.GetAsync("/api/v1/auth/files/admin/settings")).StatusCode);
    }
}
