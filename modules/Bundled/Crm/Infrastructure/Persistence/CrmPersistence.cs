using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Customers;

namespace TemplateV4.Infrastructure.Crm;


public sealed class CrmRecordRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid Version { get; set; } = Guid.NewGuid();
    public string Kind { get; set; } = "Contact";
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Outcome { get; set; } = "Open";
    public decimal Value { get; set; }
    public bool Archived { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public string Data { get; set; } = "{}";
}
public sealed class CrmConfigurationRow
{
    public int Id { get; set; } = 1;
    public Guid Version { get; set; } = Guid.NewGuid();
    public string Data { get; set; } = "{}";
}
public sealed class CrmNoteRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RecordId { get; set; }
    public Guid ActorId { get; set; }
    public string Text { get; set; } = "";
    public DateTimeOffset At { get; set; }
}
public static class CrmMappings
{
    public static void Configure(ModelBuilder model)
    {
        var records = model.Entity<CrmRecordRow>();
        records.ToTable("records", "crm"); records.HasKey(x => x.Id);
        records.Property(x => x.Version).IsConcurrencyToken();
        records.Property(x => x.Kind).HasMaxLength(20); records.Property(x => x.Name).HasMaxLength(250);
        records.Property(x => x.Email).HasMaxLength(254); records.Property(x => x.Phone).HasMaxLength(50);
        records.Property(x => x.Value).HasPrecision(18, 2); records.Property(x => x.Outcome).HasMaxLength(10);
        records.Property(x => x.Data).HasColumnType("jsonb");
        records.HasIndex(x => new { x.Kind, x.Archived, x.Name, x.Id });
        var configuration = model.Entity<CrmConfigurationRow>(); configuration.ToTable("configuration", "crm", t => t.HasCheckConstraint("CK_crm_configuration_singleton", "\"Id\" = 1"));
        configuration.HasKey(x => x.Id); configuration.Property(x => x.Version).IsConcurrencyToken();
        configuration.Property(x => x.Data).HasColumnType("jsonb");
        var notes = model.Entity<CrmNoteRow>(); notes.ToTable("notes", "crm"); notes.HasKey(x => x.Id);
        notes.Property(x => x.Text).HasMaxLength(8000);
        notes.HasOne<CrmRecordRow>().WithMany().HasForeignKey(x => x.RecordId).OnDelete(DeleteBehavior.Restrict);
        notes.HasIndex(x => new { x.RecordId, x.At });
    }
}
