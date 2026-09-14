using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TemplateV4.Domain.Users;
using TemplateV4.Infrastructure.Persistence;
using Testcontainers.PostgreSql;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class PostgresTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgres:18.6-alpine").Build();
    public async Task InitializeAsync() => await _postgres.StartAsync();
    public async Task DisposeAsync() => await _postgres.DisposeAsync();
    private FrameworkDb CreateDb() => new(new DbContextOptionsBuilder<FrameworkDb>().UseNpgsql(_postgres.GetConnectionString(), x => x.MigrationsHistoryTable("migrations", "app")).Options);
    [Fact]
    public async Task Organisation_rename_preserves_existing_files_settings_links()
    {
        await using var db = CreateDb();
        var migrator = db.GetService<IMigrator>();
        var previous = db.Database.GetMigrations().TakeWhile(x => !x.EndsWith("_RenameOrganisations", StringComparison.Ordinal)).Last();
        await migrator.MigrateAsync(previous);
        var id = Guid.NewGuid();
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO organizations.customers ("Id", "Name", "Version") VALUES ({id}, 'Retained team', {id});
            INSERT INTO files.organization_files ("Id", "CustomerId", "Name", "Size", "CreatedAt", "Ready")
            VALUES ({id}, {id}, 'retained.txt', 42, now(), true);
            UPDATE billing.settings SET "Ownership" = 'Organization';
            """);
        // Seed the historical schema without asking the current EF model to write later columns.
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO identity."AspNetUsers" ("Id", "UserName", "NormalizedUserName", "EmailConfirmed", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount")
            VALUES ({id}, {id.ToString()}, {id.ToString()}, false, false, false, false, 0);
            """);
        db.Notifications.Add(new() { UserId = id, Kind = "notificationOrganization", Link = $"/organizations/{id}/billing", CreatedAt = DateTimeOffset.UtcNow });
        await db.SaveChangesAsync();

        await migrator.MigrateAsync();
        db.ChangeTracker.Clear();
        Assert.Equal("Retained team", (await db.Set<CustomerRow>().SingleAsync()).Name);
        var file = await db.Set<TemplateV4.Infrastructure.Storage.OrganisationFileRow>().SingleAsync();
        Assert.Equal(id, file.Id); Assert.Equal(42, file.Size); Assert.True(file.Ready);
        Assert.Equal("Organisation", (await db.Set<BillingSettingsRow>().SingleAsync()).Ownership);
        var notification = await db.Notifications.SingleAsync();
        Assert.Equal("notificationOrganisation", notification.Kind);
        Assert.Equal($"/organisations/{id}/billing", notification.Link);


    }
    [Fact]
    public async Task Migrations_are_repeatable_and_include_Quartz()
    {
        await using var db = CreateDb(); await db.Database.MigrateAsync(); await db.Database.MigrateAsync();
        Assert.Empty(await db.Database.GetPendingMigrationsAsync());
        await db.Database.ExecuteSqlRawAsync("SELECT count(*) FROM quartz.qrtz_job_details");
    }
    [Fact]
    public async Task PostgreSql_enforces_optimistic_concurrency()
    {
        await using var first = CreateDb(); await first.Database.MigrateAsync();
        var id = Guid.NewGuid(); first.Users.Add(new() { Id = id, UserName = id.ToString(), NormalizedUserName = id.ToString() });
        first.Profiles.Add(UserProfile.Create(id, "Jane", "en-ZA")); await first.SaveChangesAsync();
        await using var second = CreateDb();
        var a = await first.Profiles.SingleAsync(x => x.Id == id); var b = await second.Profiles.SingleAsync(x => x.Id == id);
        a.SetDisabled(true); await first.SaveChangesAsync(); b.SetDisabled(true);
        await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => second.SaveChangesAsync());
    }
}
