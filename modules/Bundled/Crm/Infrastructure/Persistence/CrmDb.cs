using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace TemplateV4.Infrastructure.Persistence;

public sealed class CrmDb(DbContextOptions<CrmDb> options, DatabaseSession session) : FrameworkDb(options, session)
{
    protected override void OnModelCreating(ModelBuilder model)
    {
        base.OnModelCreating(model);
        // Core tables are available for joined reads; only this module owns migrations here.
        foreach (var entity in model.Model.GetEntityTypes()) entity.SetIsTableExcludedFromMigrations(true);
        TemplateV4.Infrastructure.Crm.CrmMappings.Configure(model);
        TemplateV4.Infrastructure.Crm.RecordAttachmentMappings.Configure(model);
    }
}

public sealed class CrmDesignFactory : IDesignTimeDbContextFactory<CrmDb>
{
    public CrmDb CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<CrmDb>()
        .UseNpgsql(Environment.GetEnvironmentVariable("ConnectionStrings__app") ?? "Host=localhost;Database=templatev4;Username=postgres", x => x.MigrationsHistoryTable("migrations", "crm")).Options, new DatabaseSession());
}
