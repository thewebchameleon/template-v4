using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace templatev4.Infrastructure.Persistence;

public sealed class DesignFactory : IDesignTimeDbContextFactory<FrameworkDb>
{
    public FrameworkDb CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<FrameworkDb>()
        .UseNpgsql(Environment.GetEnvironmentVariable("ConnectionStrings__app") ?? "Host=localhost;Database=templatev4;Username=postgres", x => x.MigrationsHistoryTable("migrations", "app")).Options);
}
