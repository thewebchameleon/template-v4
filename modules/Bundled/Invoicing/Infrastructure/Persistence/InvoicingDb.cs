using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace TemplateV4.Infrastructure.Persistence;

public sealed class InvoicingDb(DbContextOptions<InvoicingDb> options, DatabaseSession session) : FrameworkDb(options, session)
{
    protected override void OnModelCreating(ModelBuilder model)
    {
        base.OnModelCreating(model);
        // Core tables are available for joined reads; only this module owns migrations here.
        foreach (var entity in model.Model.GetEntityTypes()) entity.SetIsTableExcludedFromMigrations(true);
        TemplateV4.Infrastructure.Invoicing.CommercialMappings.Configure(model);
        model.Entity<TemplateV4.Infrastructure.Invoicing.InvoiceAttachmentRow>().ToTable("attachments", "invoicing").HasKey(x => new { x.RecordId, x.FileId }).HasName("PK_attachments1");
    }
}

public sealed class InvoicingDesignFactory : IDesignTimeDbContextFactory<InvoicingDb>
{
    public InvoicingDb CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<InvoicingDb>()
        .UseNpgsql(Environment.GetEnvironmentVariable("ConnectionStrings__app") ?? "Host=localhost;Database=templatev4;Username=postgres", x => x.MigrationsHistoryTable("migrations", "invoicing")).Options, new DatabaseSession());
}
