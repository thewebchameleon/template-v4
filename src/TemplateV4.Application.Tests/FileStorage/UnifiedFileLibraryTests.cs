using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using TemplateV4.Application.Billing;
using TemplateV4.Application.Users;
using TemplateV4.Domain.Users;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Storage;
using Xunit;

namespace TemplateV4.Application.Tests.FileStorage;

public sealed class FileDatabaseFactAttribute : FactAttribute
{
    public FileDatabaseFactAttribute()
    {
        if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("TEMPLATEV4_FILES_TEST_DATABASE")))
            Skip = "Set TEMPLATEV4_FILES_TEST_DATABASE to an empty disposable PostgreSQL database.";
    }
}

public sealed class UnifiedFileLibraryTests
{
    [FileDatabaseFact]
    public async Task Merge_preserves_objects_and_folders_and_enforces_shared_access_and_quota()
    {
        var options = new DbContextOptionsBuilder<FrameworkDb>().UseNpgsql(
            Environment.GetEnvironmentVariable("TEMPLATEV4_FILES_TEST_DATABASE"),
            x => x.MigrationsHistoryTable("migrations", "app")).Options;
        await using var db = new FrameworkDb(options);
        await db.GetService<IMigrator>().MigrateAsync("20260916091753_SharedOrganisationFiles");
        var writer = Guid.NewGuid(); var reader = Guid.NewGuid(); var role = Guid.NewGuid();
        foreach (var actor in new[] { writer, reader })
        {
            db.Users.Add(new AppUser { Id = actor, UserName = actor.ToString(), EmailConfirmed = true });
            db.Profiles.Add(UserProfile.Create(actor, "Files test", "en-ZA"));
        }
        db.Roles.Add(new IdentityRole<Guid> { Id = role, Name = "Files writer", NormalizedName = "FILES WRITER" });
        db.UserRoles.Add(new IdentityUserRole<Guid> { RoleId = role, UserId = writer });
        db.RoleClaims.Add(new IdentityRoleClaim<Guid> { RoleId = role, ClaimType = "permission", ClaimValue = Permissions.SharedFilesManage });
        // Seed the old schema directly: its stored-file shape predates StorageKey.
        await db.SaveChangesAsync();
        var oldFolder = Guid.NewGuid(); var personal = Guid.NewGuid(); var shared = Guid.NewGuid();
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO files.files ("Id", "OwnerId", "Name", "ContentType", "Size", "CreatedAt", "Ready", "IsFolder", "Description", "Tags", "Important", "Starred", "PurgeRequested")
            VALUES ({oldFolder}, {reader}, 'Folder', 'application/octet-stream', 0, now(), TRUE, TRUE, '', '', FALSE, FALSE, FALSE),
                   ({personal}, {reader}, 'Personal.txt', 'application/octet-stream', 3, now(), TRUE, FALSE, '', '', FALSE, FALSE, FALSE);
            INSERT INTO files.organisation_files ("Id", "UploadedBy", "Name", "Size", "CreatedAt", "Ready")
            VALUES ({shared}, {reader}, 'Shared.txt', 4, now(), TRUE);
            UPDATE files.file_storage_settings SET "DemoMode" = TRUE, "DemoStartedAt" = now() - interval '1 day';
            """);
        await db.GetService<IMigrator>().MigrateAsync("20260916144412_OrganisationBranding");
        var activationVersion = Guid.NewGuid(); var shareId = Guid.NewGuid();
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            UPDATE app.runtime_modules SET "Enabled" = FALSE, "Version" = {activationVersion} WHERE "Id" = 'my-files';
            INSERT INTO files.my_file_shares ("Id", "FileId", "Permission", "TokenHash", "CreatedAt")
            VALUES ({shareId}, {personal}, 'viewer', 'retained-share-token-hash', now());
            """);
        await db.Database.MigrateAsync();
        var activation = await db.RuntimeModules.AsNoTracking().SingleAsync(x => x.Id == "file-storage");
        Assert.False(activation.Enabled);
        Assert.Equal(activationVersion, activation.Version);
        Assert.False(await db.RuntimeModules.AnyAsync(x => x.Id == "my-files"));
        Assert.Equal("retained-share-token-hash", (await db.Set<FileStorageShare>().AsNoTracking().SingleAsync(x => x.Id == shareId)).TokenHash);
        // The rename is reversible without discarding shares or resetting activation.
        await db.GetService<IMigrator>().MigrateAsync("20260916144412_OrganisationBranding");
        await db.Database.MigrateAsync();
        Assert.Equal(activationVersion, (await db.RuntimeModules.AsNoTracking().SingleAsync(x => x.Id == "file-storage")).Version);
        Assert.Equal(personal, (await db.Set<FileStorageShare>().AsNoTracking().SingleAsync(x => x.Id == shareId)).FileId);
        Assert.False(db.Database.HasPendingModelChanges());
        Assert.False(await db.FileStorageSettings.Select(x => x.DemoMode).SingleAsync());
        var storage = new MemoryStorage();
        storage.Objects[personal.ToString("N")] = [1, 2, 3];
        storage.Objects["00000000000000000000000000000001-" + shared.ToString("N")] = [4, 5, 6, 7];
        var service = new FileStorageService(db, storage, TimeProvider.System, new NoSubscription());
        var page = await service.List(reader, 1, 10, null, "name", "asc", default);
        Assert.True(page.IsSuccess);
        Assert.Equal(3, page.Value!.Page.Total);
        Assert.Equal(7, page.Value.UsedBytes);
        Assert.All(page.Value.Page.Items, x => Assert.Equal("viewer", x.Permission));
        var download = await service.Download(writer, shared, default);
        Assert.True(download.IsSuccess);
        await using (var bytes = download.Value!.Content) Assert.Equal(4, bytes.Length);
        Assert.False((await service.Upload(reader, "Denied.txt", new MemoryStream([1]), default)).IsSuccess);
        Assert.False((await service.Move(reader, personal, new(oldFolder), default)).IsSuccess);
        Assert.True((await service.Move(writer, personal, new(oldFolder), default)).IsSuccess);
        var upload = await service.Upload(writer, "New.txt", new MemoryStream([8, 9]), default, oldFolder);
        Assert.True(upload.IsSuccess);
        Assert.True((await service.Trash(writer, shared, false, false, default)).IsSuccess);
        Assert.True((await service.Trash(writer, shared, true, false, default)).IsSuccess);
        // Uploader deactivation and attribution erasure must not hide organisation files.
        await db.Files.Where(x => x.OwnerId == reader).ExecuteUpdateAsync(x => x.SetProperty(f => f.OwnerId, (Guid?)null));
        db.Profiles.Local.Single(x => x.Id == reader).SetDisabled(true);
        await db.SaveChangesAsync();
        Assert.True((await service.Download(writer, personal, default)).IsSuccess);
        Assert.False((await service.List(reader, 1, 10, null, "name", "asc", default)).IsSuccess);
        // Reservations count files uploaded by every actor and include retained trash.
        await db.FileStorageSettings.ExecuteUpdateAsync(x => x.SetProperty(s => s.DefaultQuotaBytes, 9));
        Assert.False((await service.Upload(writer, "Over-quota.txt", new MemoryStream([1]), default)).IsSuccess);
        var share = await service.Share(writer, oldFolder, new(null, "viewer", null), default);
        Assert.True(share.IsSuccess);
        Assert.True((await service.PublicDownload(personal, share.Value!.Token!, default)).IsSuccess);
        Assert.False((await service.PublicDownload(shared, share.Value.Token!, default)).IsSuccess);
        // Two contexts must not both reserve the last available byte.
        await db.FileStorageSettings.ExecuteUpdateAsync(x => x.SetProperty(s => s.DefaultQuotaBytes, 10));
        async Task<bool> Reserve(string name)
        {
            await using var concurrentDb = new FrameworkDb(options);
            return (await new FileStorageService(concurrentDb, storage, TimeProvider.System, new NoSubscription())
                .Upload(writer, name, new MemoryStream([1]), default)).IsSuccess;
        }
        var reservations = await Task.WhenAll(Reserve("First.txt"), Reserve("Second.txt"));
        Assert.Single(reservations, x => x);
        Assert.True((await service.Trash(writer, shared, false, false, default)).IsSuccess);
        Assert.True((await service.Trash(writer, shared, false, true, default)).IsSuccess);
        await new FileRetention(db, storage, new ConfigurationBuilder().Build(), TimeProvider.System,
            NullLogger<FileRetention>.Instance).Run(default);
        Assert.DoesNotContain("00000000000000000000000000000001-" + shared.ToString("N"), storage.Objects.Keys);
        Assert.Contains(personal.ToString("N"), storage.Objects.Keys);
        await db.RoleClaims.ExecuteDeleteAsync();
        Assert.False((await service.Metadata(writer, personal, new("Denied", "", "", false, false), default)).IsSuccess);
    }

    private sealed class NoSubscription : IStorageEntitlements
    {
        public Task<long?> Quota(CancellationToken ct) => Task.FromResult<long?>(null);
        public Task<bool> CanStore(long bytes, CancellationToken ct) => Task.FromResult(true);
    }

    private sealed class MemoryStorage : IFileStorage
    {
        public Dictionary<string, byte[]> Objects { get; } = [];
        public async Task Write(string key, Stream content, CancellationToken ct)
        {
            using var bytes = new MemoryStream(); await content.CopyToAsync(bytes, ct); Objects.Add(key, bytes.ToArray());
        }
        public Task<Stream> Read(string key, CancellationToken ct) => Task.FromResult<Stream>(new MemoryStream(Objects[key]));
        public Task Delete(string key, CancellationToken ct) { Objects.Remove(key); return Task.CompletedTask; }
    }
}
