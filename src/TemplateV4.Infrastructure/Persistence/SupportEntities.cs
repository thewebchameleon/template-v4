using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Persistence;

public sealed class SupportTicketRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RequesterId { get; set; }
    public string Subject { get; set; } = "";
    public string Description { get; set; } = "";
    public Guid CategoryId { get; set; }
    public string Status { get; set; } = "Open";
    public string Priority { get; set; } = "Normal";
    public Guid? AssigneeId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Guid Version { get; set; } = Guid.NewGuid();
}
public sealed class SupportCategoryRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "";
    public bool Active { get; set; } = true;
    public Guid Version { get; set; } = Guid.NewGuid();
}
public sealed class SupportMessageRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TicketId { get; set; }
    public Guid? AuthorId { get; set; }
    public string Body { get; set; } = "";
    public bool Internal { get; set; }
    public string Kind { get; set; } = "reply";
    public DateTimeOffset At { get; set; }
}
public sealed class SupportAttachmentRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TicketId { get; set; }
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = "";
    public byte[] Content { get; set; } = [];
    public DateTimeOffset At { get; set; }
}
internal static class SupportModel
{
    public static void Configure(ModelBuilder model)
    {
        model.Entity<SupportCategoryRow>(e =>
        {
            e.ToTable("categories", "support"); e.Property(x => x.Name).HasMaxLength(80); e.HasIndex(x => x.Name).IsUnique(); e.Property(x => x.Version).IsConcurrencyToken();
            e.HasData(new SupportCategoryRow { Id = new("9a0e9b19-33fb-49e0-8bd0-77eb7eca5c20"), Name = "General", Version = new("44639415-d2d9-4517-be2d-c119d95a5f83") });
        });
        model.Entity<SupportTicketRow>(e =>
        {
            e.ToTable("tickets", "support"); e.Property(x => x.Subject).HasMaxLength(180); e.Property(x => x.Description).HasMaxLength(10000);
            e.Property(x => x.Status).HasMaxLength(30); e.Property(x => x.Priority).HasMaxLength(20); e.Property(x => x.Version).IsConcurrencyToken();
            e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.RequesterId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.AssigneeId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<SupportCategoryRow>().WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.RequesterId, x.UpdatedAt, x.Id }); e.HasIndex(x => new { x.Status, x.UpdatedAt, x.Id }); e.HasIndex(x => x.AssigneeId);
        });
        model.Entity<SupportMessageRow>(e =>
        {
            e.ToTable("messages", "support"); e.Property(x => x.Body).HasMaxLength(10000); e.Property(x => x.Kind).HasMaxLength(40);
            e.HasOne<SupportTicketRow>().WithMany().HasForeignKey(x => x.TicketId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.AuthorId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.TicketId, x.At, x.Id });
        });
        model.Entity<SupportAttachmentRow>(e =>
        {
            e.ToTable("attachments", "support", t => t.HasCheckConstraint("CK_support_attachment_size", "octet_length(\"Content\") BETWEEN 1 AND 5242880"));
            e.Property(x => x.Name).HasMaxLength(180); e.HasOne<SupportTicketRow>().WithMany().HasForeignKey(x => x.TicketId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
