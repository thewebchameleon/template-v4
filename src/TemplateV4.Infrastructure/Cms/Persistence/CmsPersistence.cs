using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Cms;

public sealed class ArticleRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid Version { get; set; } = Guid.NewGuid();
    public string Slug { get; set; } = "";
    public string Title { get; set; } = "";
    public string Draft { get; set; } = "{}";
    public string? PublishedContent { get; set; }
    public bool Published { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public DateTimeOffset? PublishedUpdatedAt { get; set; }
}
public static class CmsMappings
{
    public static void Configure(ModelBuilder model)
    {
        ContentMappings.Configure(model);
        var sections = model.Entity<CmsSectionsRow>();
        sections.ToTable("sections", "cms"); sections.HasKey(x => x.Id);
        sections.Property(x => x.Version).IsConcurrencyToken();
        sections.HasData(new CmsSectionsRow { Version = new Guid("06416342-7225-40b5-95d3-216c4a5971d2") });
        var row = model.Entity<ArticleRow>();
        row.ToTable("articles", "cms");
        row.HasKey(x => x.Id);
        row.Property(x => x.Version).IsConcurrencyToken();
        row.Property(x => x.Slug).HasMaxLength(160);
        row.Property(x => x.Title).HasMaxLength(200);
        row.HasIndex(x => x.Slug).IsUnique();
        row.HasIndex(x => new { x.Published, x.PublishedAt, x.Id });
        // Text preserves the exact serialization for draft/published comparison.
        row.Property(x => x.Draft).HasColumnType("text");
        row.Property(x => x.PublishedContent).HasColumnType("text");
        model.Entity<RuntimeModuleSettings>().HasData(new RuntimeModuleSettings
        {
            Id = "cms",
            Enabled = true,
            Version = new Guid("a274bd77-60b9-4128-af9d-1084b2d8a34e")
        });
    }
}
