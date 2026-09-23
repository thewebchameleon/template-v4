using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace TemplateV4.Infrastructure.Persistence;

public sealed class SupportDb(DbContextOptions<SupportDb> options, DatabaseSession session) : FrameworkDb(options, session)
{
    protected override void OnModelCreating(ModelBuilder model)
    {
        base.OnModelCreating(model);
        // Core tables are available for joined reads; only this module owns migrations here.
        foreach (var entity in model.Model.GetEntityTypes()) entity.SetIsTableExcludedFromMigrations(true);
        SupportModel.Configure(model);
        model.Entity<SupportAttachmentRow>().HasKey(x => x.Id).HasName("PK_attachments2");
        TemplateV4.Infrastructure.Support.SupportSettingsMappings.Configure(model);
        model.Entity<TemplateV4.Infrastructure.Support.SupportSettingsRow>().HasKey(x => x.Id).HasName("PK_settings2");
        TemplateV4.Infrastructure.Contact.ContactMappings.Configure(model);
    }
}

public sealed class SupportDesignFactory : IDesignTimeDbContextFactory<SupportDb>
{
    public SupportDb CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<SupportDb>()
        .UseNpgsql(Environment.GetEnvironmentVariable("ConnectionStrings__app") ?? "Host=localhost;Database=templatev4;Username=postgres", x => x.MigrationsHistoryTable("migrations", "support")).Options, new DatabaseSession());
}
