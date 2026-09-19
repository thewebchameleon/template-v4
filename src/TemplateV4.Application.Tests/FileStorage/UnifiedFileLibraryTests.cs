using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using TemplateV4.Application.CommercialBilling;
using TemplateV4.Application.FileStorage;
using TemplateV4.Application.Users;
using TemplateV4.Domain.Users;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using TemplateV4.Infrastructure.Storage;
using TemplateV4.SharedKernel;
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
        var connectionString = Environment.GetEnvironmentVariable("TEMPLATEV4_FILES_TEST_DATABASE")!;
        var options = new DbContextOptionsBuilder<FrameworkDb>().UseNpgsql(
            connectionString,
            x => x.MigrationsHistoryTable("migrations", "app")).Options;
        await using var db = new FrameworkDb(options);
        await db.GetService<IMigrator>().MigrateAsync("20260916091753_SharedOrganisationFiles");
        var writer = Guid.NewGuid(); var reader = Guid.NewGuid(); var role = Guid.NewGuid();
        var hasher = new PasswordHasher<AppUser>();
        foreach (var actor in new[] { writer, reader })
        {
            var user = new AppUser { Id = actor, UserName = actor.ToString(), EmailConfirmed = true };
            if (actor == writer) user.PasswordHash = hasher.HashPassword(user, "Correct horse battery staple 7!");
            db.Users.Add(user);
            db.Profiles.Add(UserProfile.Create(actor, "Files test", "en-ZA"));
        }
        db.Roles.Add(new IdentityRole<Guid> { Id = role, Name = "Files writer", NormalizedName = "FILES WRITER" });
        db.UserRoles.Add(new IdentityUserRole<Guid> { RoleId = role, UserId = writer });
        db.RoleClaims.Add(new IdentityRoleClaim<Guid> { RoleId = role, ClaimType = "permission", ClaimValue = Permissions.SharedFilesManage });
        db.RoleClaims.Add(new IdentityRoleClaim<Guid> { RoleId = role, ClaimType = "permission", ClaimValue = Permissions.FileStoragePurge });
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
        db.RoleClaims.Add(new IdentityRoleClaim<Guid> { RoleId = role, ClaimType = "permission", ClaimValue = Permissions.FileStoragePurge });
        await db.SaveChangesAsync();
        var passwordVerifier = new FreshPasswordVerifier(db,
            new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["ConnectionStrings:app"] = connectionString }).Build(),
            TimeProvider.System, hasher);
        var purgeHandler = new PurgeAllFileStorageDataHandler(db, new TestExecutionContext(writer), passwordVerifier, TimeProvider.System);
        await using (var purgeTransaction = await db.Database.BeginTransactionAsync())
        {
            var purge = await purgeHandler.Handle(new(PurgeAllFileStorageData.RequiredConfirmation, "Correct horse battery staple 7!"), default);
            Assert.True(purge.IsSuccess);
            await db.SaveChangesAsync();
            await purgeTransaction.CommitAsync();
        }
        Assert.Empty(await db.Set<FileStorageShare>().ToArrayAsync());
        Assert.All(await db.Files.Where(x => x.PurgedAt == null).ToArrayAsync(), file => Assert.True(file.PurgeRequested));
        await new FileRetention(db, storage, new ConfigurationBuilder().Build(), TimeProvider.System,
            NullLogger<FileRetention>.Instance).Run(default);
        Assert.Empty(storage.Objects);
    }

    [Fact]
    public void Purge_confirmation_requires_the_exact_phrase_and_never_formats_the_password()
    {
        var validator = new PurgeAllFileStorageDataValidator();
        Assert.NotEmpty(validator.Validate(new("purge all data", "secret")));
        Assert.NotEmpty(validator.Validate(new(PurgeAllFileStorageData.RequiredConfirmation, "")));
        var request = new PurgeAllFileStorageData(PurgeAllFileStorageData.RequiredConfirmation, "top-secret");
        Assert.Empty(validator.Validate(request));
        Assert.DoesNotContain("top-secret", request.ToString(), StringComparison.Ordinal);
    }

    private sealed class NoSubscription : ICommercialEntitlements
    {
        public Task<long?> Limit(string code, CancellationToken ct) => Task.FromResult<long?>(null);
        public Task<long> Usage(string code, CancellationToken ct) => Task.FromResult(0L);
        public Task<bool> CanConsume(string code, long quantity, CancellationToken ct) => Task.FromResult(true);
        public Task RecordUsage(string code, long quantity, DateTimeOffset at, CancellationToken ct) => Task.CompletedTask;
    }

    private sealed class TestExecutionContext(Guid actor) : IExecutionContext
    {
        public Guid? ActorId => actor;
        public IReadOnlySet<string> Permissions { get; } = new HashSet<string> { TemplateV4.Application.Users.Permissions.FileStoragePurge };
        public string Culture => "en-ZA";
        public string? TraceParent => null;
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
