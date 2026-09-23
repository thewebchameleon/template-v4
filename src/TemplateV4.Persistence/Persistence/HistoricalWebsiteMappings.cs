using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Website;

// Retained only so the permanent migration history does not propose dropping historical data.
public sealed class WebsiteRow
{
    public int Id { get; set; } = 1;
    public Guid Version { get; set; }
    public string Details { get; set; } = "{}";
    public string NotificationEmail { get; set; } = "";
    public bool Configured { get; set; }
    public bool Enabled { get; set; }
}

public sealed class WebsiteImageRow
{
    public Guid Id { get; set; }
    public string ContentType { get; set; } = "";
}

public static class WebsiteMappings
{
    public static void Configure(ModelBuilder model)
    {
        var site = model.Entity<WebsiteRow>();
        site.ToTable("settings", "website"); site.HasKey(x => x.Id);
        site.Property(x => x.Version).IsConcurrencyToken();
        site.HasData(new WebsiteRow { Version = new Guid("1dd69198-4c66-431d-b35b-cc8d4d65a123") });
        var image = model.Entity<WebsiteImageRow>();
        image.ToTable("images", "website"); image.HasKey(x => x.Id);
    }
}
