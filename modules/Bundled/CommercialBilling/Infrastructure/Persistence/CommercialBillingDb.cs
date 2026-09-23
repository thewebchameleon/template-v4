using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace TemplateV4.Infrastructure.Persistence;

public sealed class CommercialBillingDb(DbContextOptions<CommercialBillingDb> options, DatabaseSession session) : FrameworkDb(options, session)
{
    protected override void OnModelCreating(ModelBuilder model)
    {
        base.OnModelCreating(model);
        // Core tables are available for joined reads; only this module owns migrations here.
        foreach (var entity in model.Model.GetEntityTypes()) entity.SetIsTableExcludedFromMigrations(true);
        CommercialBillingModel.Configure(model);
    }
}

public sealed class CommercialBillingDesignFactory : IDesignTimeDbContextFactory<CommercialBillingDb>
{
    public CommercialBillingDb CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<CommercialBillingDb>()
        .UseNpgsql(Environment.GetEnvironmentVariable("ConnectionStrings__app") ?? "Host=localhost;Database=templatev4;Username=postgres", x => x.MigrationsHistoryTable("migrations", "commercial_billing")).Options, new DatabaseSession());
}
