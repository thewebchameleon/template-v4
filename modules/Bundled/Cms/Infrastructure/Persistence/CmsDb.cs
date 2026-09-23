using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace TemplateV4.Infrastructure.Persistence;

public sealed class CmsDb(DbContextOptions<CmsDb> options, DatabaseSession session) : FrameworkDb(options, session)
{
    protected override void OnModelCreating(ModelBuilder model)
    {
        base.OnModelCreating(model);
        // Core tables are available for joined reads; only this module owns migrations here.
        foreach (var entity in model.Model.GetEntityTypes()) entity.SetIsTableExcludedFromMigrations(true);
        TemplateV4.Infrastructure.Cms.CmsMappings.Configure(model);
    }
}

public sealed class CmsDesignFactory : IDesignTimeDbContextFactory<CmsDb>
{
    public CmsDb CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<CmsDb>()
        .UseNpgsql(Environment.GetEnvironmentVariable("ConnectionStrings__app") ?? "Host=localhost;Database=templatev4;Username=postgres", x => x.MigrationsHistoryTable("migrations", "cms")).Options, new DatabaseSession());
}
