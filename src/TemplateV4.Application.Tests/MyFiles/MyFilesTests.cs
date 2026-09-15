using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Storage;
using Xunit;
namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task My_files_concurrent_uploads_reserve_against_quota()
    {
        Guid owner;
        await using (var scope = _services.CreateAsyncScope())
        {
            owner = (await User(scope.ServiceProvider)).Id;
            var service = scope.ServiceProvider.GetRequiredService<MyFilesService>();
            await service.SetQuota(owner, owner, new(14), default);
            using var initial = new MemoryStream(new byte[4]);
            Assert.True((await service.Upload(owner, "initial.bin", initial, default)).IsSuccess);
        }
        async Task<Result<FileItem>> Upload(string name)
        {
            await using var scope = _services.CreateAsyncScope(); using var bytes = new MemoryStream(new byte[6]);
            return await scope.ServiceProvider.GetRequiredService<MyFilesService>().Upload(owner, name, bytes, default);
        }
        var outcomes = await Task.WhenAll(Upload("first.bin"), Upload("second.bin"));
        Assert.Single(outcomes, x => x.IsSuccess); Assert.Equal("files.quota", Assert.Single(outcomes, x => !x.IsSuccess).Error!.Code);
    }
    [Fact]
    public async Task My_files_public_HTTP_links_are_anonymous_scoped_and_module_gated()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var owner = await User(sp); var service = sp.GetRequiredService<MyFilesService>();
        var folder = (await service.CreateFolder(owner.Id, new("Public folder"), default)).Value!;
        using var bytes = new MemoryStream("shared content"u8.ToArray()); var file = (await service.Upload(owner.Id, "content.html", bytes, default, folder.Id)).Value!;
        var link = (await service.Share(owner.Id, folder.Id, new(null, "viewer", null), default)).Value!;
        var config = new Dictionary<string, string?>(_configuration) { ["Storage:Path"] = Path.Combine(_directory, "files"), ["Features:my-files:Enabled"] = "true" };
        await using var factory = new ApiFactory(config); using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost"), AllowAutoRedirect = false });
        var root = $"/api/v1/auth/my-files/public/{folder.Id}";
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(root)).StatusCode);
        client.DefaultRequestHeaders.Add("X-File-Share", link.Token);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync(root)).StatusCode);
        Assert.Equal(file.Id, Assert.Single((await client.GetFromJsonAsync<FilePage>(root + "/children"))!.Page.Items).Id);
        using var download = await client.GetAsync($"/api/v1/auth/my-files/public/{file.Id}/download");
        Assert.Equal(HttpStatusCode.OK, download.StatusCode); Assert.Equal("attachment", download.Content.Headers.ContentDisposition!.DispositionType); Assert.Equal("application/octet-stream", download.Content.Headers.ContentType!.MediaType); Assert.True(download.Headers.CacheControl!.NoStore);
        Assert.Equal("shared content", await download.Content.ReadAsStringAsync());
        Assert.NotEqual(HttpStatusCode.OK, (await client.PostAsJsonAsync($"/api/v1/auth/my-files/{file.Id}/metadata", new FileMetadataRequest("attack", "", "", false, false))).StatusCode);
        await service.Revoke(owner.Id, folder.Id, link.Id, default); Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(root)).StatusCode);
        config["Features:my-files:Enabled"] = "false";
        await using var disabled = new ApiFactory(config); using var hidden = disabled.CreateClient(new() { BaseAddress = new("https://localhost") }); hidden.DefaultRequestHeaders.Add("X-File-Share", link.Token);
        Assert.Equal(HttpStatusCode.NotFound, (await hidden.GetAsync(root)).StatusCode);
    }
    [Fact]
    public async Task My_files_groups_recent_and_quota_segments_follow_folder_scope()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var owner = await User(sp); var service = sp.GetRequiredService<MyFilesService>();
        var folder = (await service.CreateFolder(owner.Id, new("Projects"), default)).Value!;
        using var bytes = new MemoryStream(new byte[5]);
        var image = (await service.Upload(owner.Id, "photo.png", bytes, default, folder.Id)).Value!;
        bytes.Position = 0; var other = (await service.Upload(owner.Id, "unrecognized.format", bytes, default)).Value!;
        Assert.True((await service.Metadata(owner.Id, image.Id, new(image.Name, "Description", "design, draft", true, true), default)).IsSuccess);
        var home = (await service.List(owner.Id, 1, 10, null, "updatedAt", "desc", default)).Value!;
        Assert.Equal(1, home.FileCount); Assert.Equal(1, Assert.Single(home.Folders).ItemCount); Assert.Equal(1, Assert.Single(home.Folders).FileCount);
        Assert.Equal(2, home.Page.Total); Assert.Equal(3, home.Recent.Length); Assert.Contains(home.Recent, x => x.Id == folder.Id);
        Assert.Equal(10, home.Usage.Sum(x => x.Bytes)); Assert.Contains(home.Usage, x => x.Category == "images" && x.Bytes == 5); Assert.Contains(home.Usage, x => x.Category == "other" && x.Bytes == 5);
        var selected = (await service.List(owner.Id, 1, 10, null, "updatedAt", "desc", default, folder.Id)).Value!;
        Assert.Equal(image.Id, Assert.Single(selected.Recent).Id);
        Assert.Equal(image.Id, Assert.Single((await service.List(owner.Id, 1, 10, null, "updatedAt", "desc", default, group: "important")).Value!.Page.Items).Id);
        Assert.Equal(image.Id, Assert.Single((await service.List(owner.Id, 1, 10, "draft", "name", "asc", default, group: "starred")).Value!.Page.Items).Id);
        Assert.True((await service.CreateFolder(owner.Id, new("Nested", folder.Id), default)).IsSuccess);
        var refreshedFolder = Assert.Single((await service.List(owner.Id, 1, 10, null, "name", "asc", default)).Value!.Folders, x => x.Id == folder.Id);
        Assert.Equal(2, refreshedFolder.ItemCount); Assert.Equal(1, refreshedFolder.FileCount);
        for (var index = 0; index < 6; index++) Assert.True((await service.CreateFolder(owner.Id, new($"Recent {index}"), default)).IsSuccess);
        var cappedRecent = (await service.List(owner.Id, 1, 10, null, "updatedAt", "desc", default)).Value!.Recent;
        Assert.Equal(6, cappedRecent.Length); Assert.Contains(cappedRecent, x => x.IsFolder);
        Assert.False((await service.Move(owner.Id, folder.Id, new(folder.Id), default)).IsSuccess);
        Assert.True((await service.Move(owner.Id, other.Id, new(folder.Id), default)).IsSuccess);
        bytes.Position = 0; var duplicate = (await service.Upload(owner.Id, other.Name, bytes, default)).Value!;
        Assert.True((await service.Move(owner.Id, duplicate.Id, new(folder.Id), default)).IsSuccess);
        var renamed = (await service.List(owner.Id, 1, 10, null, "name", "asc", default, folder.Id)).Value!.Page.Items.Single(x => x.Id == duplicate.Id);
        Assert.Equal("unrecognized (1).format", renamed.Name);
    }
    [Fact]
    public async Task My_files_important_and_starred_folder_counts_match_their_filtered_contents()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var owner = await User(sp); var service = sp.GetRequiredService<MyFilesService>();
        var folder = (await service.CreateFolder(owner.Id, new("Projects"), default)).Value!;
        using var bytes = new MemoryStream(new byte[1]);
        var important = (await service.Upload(owner.Id, "important.txt", bytes, default, folder.Id)).Value!;
        bytes.Position = 0; var starred = (await service.Upload(owner.Id, "starred.txt", bytes, default, folder.Id)).Value!;
        bytes.Position = 0; await service.Upload(owner.Id, "ordinary.txt", bytes, default, folder.Id);
        Assert.True((await service.Metadata(owner.Id, important.Id, new(important.Name, "", "", true, false), default)).IsSuccess);
        Assert.True((await service.Metadata(owner.Id, starred.Id, new(starred.Name, "", "", false, true), default)).IsSuccess);

        var importantRoot = (await service.List(owner.Id, 1, 10, null, "name", "asc", default, group: "important")).Value!;
        Assert.Equal(1, Assert.Single(importantRoot.Folders, x => x.Id == folder.Id).FileCount);
        var importantFolder = (await service.List(owner.Id, 1, 10, null, "name", "asc", default, folder.Id, "important")).Value!;
        Assert.Equal(important.Id, Assert.Single(importantFolder.Page.Items).Id);
        Assert.Equal(1, importantFolder.FileCount);

        var starredRoot = (await service.List(owner.Id, 1, 10, null, "name", "asc", default, group: "starred")).Value!;
        Assert.Equal(1, Assert.Single(starredRoot.Folders, x => x.Id == folder.Id).FileCount);
        var starredFolder = (await service.List(owner.Id, 1, 10, null, "name", "asc", default, folder.Id, "starred")).Value!;
        Assert.Equal(starred.Id, Assert.Single(starredFolder.Page.Items).Id);
        Assert.Equal(1, starredFolder.FileCount);
    }
    [Fact]
    public async Task My_files_sharing_inherits_permissions_expires_and_revokes_public_links()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var owner = await User(sp); var viewer = await User(sp); var editor = await User(sp); var service = sp.GetRequiredService<MyFilesService>(); var db = sp.GetRequiredService<FrameworkDb>();
        var folder = (await service.CreateFolder(owner.Id, new("Shared"), default)).Value!;
        var viewShare = (await service.Share(owner.Id, folder.Id, new(viewer.Email, "viewer", null), default)).Value!;
        Assert.True((await service.Share(owner.Id, folder.Id, new(editor.Email, "editor", null), default)).IsSuccess);
        using var bytes = new MemoryStream(new byte[4]); var file = (await service.Upload(owner.Id, "data.txt", bytes, default, folder.Id)).Value!;
        var shared = (await service.List(viewer.Id, 1, 10, null, "name", "asc", default, folder.Id, "shared")).Value!;
        Assert.Equal("viewer", Assert.Single(shared.Page.Items).Permission); Assert.Equal(0, shared.UsedBytes);
        Assert.False((await service.Metadata(viewer.Id, file.Id, new("changed.txt", "", "", false, false), default)).IsSuccess);
        Assert.True((await service.Metadata(editor.Id, file.Id, new("changed.txt", "notes", "", false, false), default)).IsSuccess);
        Assert.False((await service.Delete(editor.Id, file.Id, default)).IsSuccess);
        Assert.False((await service.Share(editor.Id, file.Id, new(null, "viewer", null), default)).IsSuccess);
        Assert.False((await service.Share(owner.Id, file.Id, new(null, "editor", null), default)).IsSuccess);
        var link = (await service.Share(owner.Id, folder.Id, new(null, "viewer", DateTimeOffset.UtcNow.AddDays(7)), default)).Value!;
        Assert.NotNull(link.Token); Assert.True((await service.PublicItem(file.Id, link.Token!, default)).IsSuccess);
        var unrelated = (await service.CreateFolder(owner.Id, new("Private"), default)).Value!;
        Assert.False((await service.PublicItem(unrelated.Id, link.Token!, default)).IsSuccess);
        Assert.Equal(file.Id, Assert.Single((await service.List(Guid.Empty, 1, 10, null, "name", "asc", default, folder.Id, token: link.Token)).Value!.Page.Items).Id);
        await db.Set<MyFileShare>().Where(x => x.Id == link.Id).ExecuteUpdateAsync(s => s.SetProperty(x => x.ExpiresAt, DateTimeOffset.UtcNow.AddMinutes(-1)));
        Assert.False((await service.PublicItem(file.Id, link.Token!, default)).IsSuccess);
        await service.Revoke(owner.Id, folder.Id, viewShare.Id, default);
        Assert.False((await service.Download(viewer.Id, file.Id, default)).IsSuccess);
    }
    [Fact]
    public async Task My_files_trash_and_purge_update_quota_without_double_counting()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var owner = await User(sp); var service = sp.GetRequiredService<MyFilesService>();
        await service.SetQuota(owner.Id, owner.Id, new(12), default);
        using var initial = new MemoryStream(new byte[] { 1, 2, 3, 4 }); var file = (await service.Upload(owner.Id, "report.pdf", initial, default)).Value!;
        var page = (await service.List(owner.Id, 1, 10, null, "name", "asc", default)).Value!; Assert.Equal(4, page.UsedBytes); Assert.Equal(4, page.Usage.Single(x => x.Category == "documents").Bytes);
        await service.Delete(owner.Id, file.Id, default);
        var trash = (await service.List(owner.Id, 1, 10, null, "name", "asc", default, group: "trash")).Value!; Assert.Equal(4, trash.UsedBytes); Assert.Equal(4, trash.Usage.Single(x => x.Category == "trash").Bytes);
        await service.Trash(owner.Id, file.Id, false, true, default); await sp.GetRequiredService<FileRetention>().Run(default);
        Assert.Equal(0, (await service.List(owner.Id, 1, 10, null, "name", "asc", default)).Value!.UsedBytes);
    }
    [Fact]
    public async Task My_files_empty_folder_deletion_preserves_prior_trash_and_revokes_sharing()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var owner = await User(sp); var service = sp.GetRequiredService<MyFilesService>();
        var folder = (await service.CreateFolder(owner.Id, new("Parent"), default)).Value!;
        var child = (await service.CreateFolder(owner.Id, new("Child", folder.Id), default)).Value!;
        using var bytes = new MemoryStream(new byte[2]); var file = (await service.Upload(owner.Id, "a.bin", bytes, default, child.Id)).Value!;
        await service.Delete(owner.Id, file.Id, default);
        var link = (await service.Share(owner.Id, folder.Id, new(null, "viewer", null), default)).Value!;
        Assert.Equal("files.folder_not_empty", (await service.Delete(owner.Id, folder.Id, default)).Error!.Code);
        Assert.True((await service.Delete(owner.Id, child.Id, default)).IsSuccess);
        await service.Delete(owner.Id, folder.Id, default); Assert.False((await service.PublicItem(child.Id, link.Token!, default)).IsSuccess);
        await service.Trash(owner.Id, folder.Id, true, false, default);
        Assert.False((await service.Download(owner.Id, file.Id, default)).IsSuccess);
        Assert.False((await service.List(owner.Id, 1, 10, null, "name", "asc", default, child.Id)).IsSuccess);
        Assert.False((await service.PublicItem(child.Id, link.Token!, default)).IsSuccess);
        await service.Delete(owner.Id, folder.Id, default); await service.Trash(owner.Id, file.Id, true, false, default);
        Assert.Null((await service.List(owner.Id, 1, 10, null, "name", "asc", default)).Value!.Page.Items.Single(x => x.Id == file.Id).ParentId);
    }
}
