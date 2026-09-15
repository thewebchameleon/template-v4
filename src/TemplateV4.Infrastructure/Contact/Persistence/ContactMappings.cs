using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Contact;

public sealed class ContactRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Message { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
    public bool Read { get; set; }
}
public static class ContactMappings
{
    public static void Configure(ModelBuilder model)
    {
        var row = model.Entity<ContactRow>();
        row.ToTable("enquiries", "contact"); row.HasKey(x => x.Id);
        row.Property(x => x.Name).HasMaxLength(120); row.Property(x => x.Email).HasMaxLength(254); row.Property(x => x.Message).HasMaxLength(5000);
        row.HasIndex(x => new { x.CreatedAt, x.Id });
        model.Entity<RuntimeModuleSettings>().HasData(new RuntimeModuleSettings { Id = "contact", Enabled = true, Version = new Guid("1435e55e-cf92-4619-baf4-b4a27327e98b") });
    }
}
