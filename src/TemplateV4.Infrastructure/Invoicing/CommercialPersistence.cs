using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed class CommercialDocumentRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganisationId { get; set; }
    public Guid Version { get; set; } = Guid.NewGuid();
    public string Number { get; set; } = "";
    public string Kind { get; set; } = "";
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = "";
    public string Snapshot { get; set; } = "{}";
    public decimal Total { get; set; }
    public decimal Credits { get; set; }
    public decimal Paid { get; set; }
    public decimal Refunded { get; set; }
    public DateTimeOffset IssuedAt { get; set; }
    public Guid ActorId { get; set; }
    public string? OriginModule { get; set; }
    public string? OriginType { get; set; }
    public Guid? OriginId { get; set; }
    public Guid? QuotationId { get; set; }
    public Guid? PreviousRevisionId { get; set; }
    public Guid? CorrectsId { get; set; }
    public bool Accepted { get; set; }
    public DateTimeOffset? AcceptedAt { get; set; }
    public string? AcceptanceReference { get; set; }
    public Guid? AcceptedBy { get; set; }
}
public sealed class IssuerSettingsRow
{
    public Guid OrganisationId { get; set; }
    public Guid Version { get; set; } = Guid.NewGuid();
    public long NextNumber { get; set; } = 1;
    public string Data { get; set; } = "{}";
}
public sealed class CommercialOperationRow
{
    public Guid OrganisationId { get; set; }
    public Guid Key { get; set; }
    public string Fingerprint { get; set; } = "";
    public Guid ResultId { get; set; }
}
public sealed class FinancialEntryRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganisationId { get; set; }
    public Guid DocumentId { get; set; }
    public string Kind { get; set; } = "";
    public decimal Amount { get; set; }
    public string Reason { get; set; } = "";
    public string Method { get; set; } = "";
    public DateOnly Date { get; set; }
    public string? Reference { get; set; }
    public Guid ActorId { get; set; }
    public DateTimeOffset At { get; set; }
    public Guid? IssuedDocumentId { get; set; }
}
public static class CommercialMappings
{
    public static void Configure(ModelBuilder model)
    {
        var d = model.Entity<CommercialDocumentRow>(); d.ToTable("documents", "invoicing"); d.HasKey(x => new { x.OrganisationId, x.Id });
        d.Property(x => x.Version).IsConcurrencyToken(); d.Property(x => x.Snapshot).HasColumnType("jsonb");
        d.Property(x => x.Kind).HasMaxLength(20); d.Property(x => x.Number).HasMaxLength(80); d.Property(x => x.CustomerName).HasMaxLength(250);
        d.Property(x => x.OriginModule).HasMaxLength(100); d.Property(x => x.OriginType).HasMaxLength(100); d.Property(x => x.AcceptanceReference).HasMaxLength(1000);
        d.Property(x => x.Total).HasPrecision(18, 2); d.Property(x => x.Credits).HasPrecision(18, 2); d.Property(x => x.Paid).HasPrecision(18, 2); d.Property(x => x.Refunded).HasPrecision(18, 2);
        d.HasIndex(x => new { x.OrganisationId, x.Number }).IsUnique();
        d.HasIndex(x => new { x.OrganisationId, x.OriginModule, x.OriginType, x.OriginId }).IsUnique().HasFilter("\"Kind\" = 'Invoice' AND \"OriginId\" IS NOT NULL");
        d.HasIndex(x => new { x.OrganisationId, x.IssuedAt, x.Id });
        var s = model.Entity<IssuerSettingsRow>(); s.ToTable("issuer_settings", "invoicing"); s.HasKey(x => x.OrganisationId); s.Property(x => x.Version).IsConcurrencyToken(); s.Property(x => x.Data).HasColumnType("jsonb");
        var o = model.Entity<CommercialOperationRow>(); o.ToTable("operations", "invoicing"); o.HasKey(x => new { x.OrganisationId, x.Key }); o.Property(x => x.Fingerprint).HasMaxLength(64);
        var e = model.Entity<FinancialEntryRow>(); e.ToTable("entries", "invoicing"); e.HasKey(x => new { x.OrganisationId, x.Id });
        e.Property(x => x.Amount).HasPrecision(18, 2); e.Property(x => x.Kind).HasMaxLength(20); e.Property(x => x.Method).HasMaxLength(10);
        e.Property(x => x.Reason).HasMaxLength(1000); e.Property(x => x.Reference).HasMaxLength(250);
        e.HasOne<CommercialDocumentRow>().WithMany().HasForeignKey(x => new { x.OrganisationId, x.DocumentId }).OnDelete(DeleteBehavior.Restrict);
    }
}
