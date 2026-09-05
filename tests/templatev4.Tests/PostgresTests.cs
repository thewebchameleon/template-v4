using Microsoft.EntityFrameworkCore;
using templatev4.Domain.Users;
using templatev4.Infrastructure.Persistence;
using Testcontainers.PostgreSql;
using Xunit;

namespace templatev4.Tests;

public sealed class PostgresTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgres:18.6-alpine").Build();
    public async Task InitializeAsync() => await _postgres.StartAsync();
    public async Task DisposeAsync() => await _postgres.DisposeAsync();
    private FrameworkDb CreateDb() => new(new DbContextOptionsBuilder<FrameworkDb>().UseNpgsql(_postgres.GetConnectionString(), x => x.MigrationsHistoryTable("migrations", "app")).Options);
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
