using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Website;

public sealed class WebsiteRow
{
    public int Id { get; set; } = 1;
    public Guid Version { get; set; }
    public string Details { get; set; } = "{}";
    // Historical column retained for the forward Support settings migration; no longer exposed or edited by Website.
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
