using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Cms;

public sealed class ContentCollectionRow
{
    public string Key { get; set; } = "";
    public string Label { get; set; } = "";
    public Guid Version { get; set; } = Guid.NewGuid();
    public string Fields { get; set; } = "[]";
    public string Workflow { get; set; } = "{}";
    public bool PublicRead { get; set; }
}
public sealed class ContentSchemaRow
{
    public Guid Id { get; set; }
    public string Collection { get; set; } = "";
    public string Fields { get; set; } = "[]";
}
public sealed class ContentItemRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Collection { get; set; } = "";
    public Guid Version { get; set; } = Guid.NewGuid();
    public Guid DraftRevisionId { get; set; }
    public Guid? PublishedRevisionId { get; set; }
    public string Title { get; set; } = "";
    public string State { get; set; } = "Draft";
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public DateTimeOffset? PublishedUpdatedAt { get; set; }
}
public sealed class ContentRevisionRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ItemId { get; set; }
    public Guid SchemaId { get; set; }
    public Guid? AuthorId { get; set; }
    public string Values { get; set; } = "{}";
    public string? Workflow { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
public sealed class ContentRelationRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RevisionId { get; set; }
    public Guid TargetId { get; set; }
    public string Path { get; set; } = "";
}
public sealed class ContentGrantRow
{
    public string Collection { get; set; } = "";
    public Guid RoleId { get; set; }
    public string Permission { get; set; } = "";
}
public sealed class ContentReviewRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RevisionId { get; set; }
    public Guid ReviewerId { get; set; }
    public string State { get; set; } = "Pending";
    public string? Comment { get; set; }
}
public static class ContentMappings
{
    public static void Configure(ModelBuilder model)
    {
        var collections = model.Entity<ContentCollectionRow>();
        collections.ToTable("collections", "cms"); collections.HasKey(x => x.Key);
        collections.Property(x => x.Key).HasMaxLength(64); collections.Property(x => x.Version).IsConcurrencyToken();
        var schemas = model.Entity<ContentSchemaRow>();
        schemas.ToTable("schemas", "cms"); schemas.HasKey(x => x.Id);
        schemas.HasOne<ContentCollectionRow>().WithMany().HasForeignKey(x => x.Collection).OnDelete(DeleteBehavior.Restrict);
        var items = model.Entity<ContentItemRow>();
        items.ToTable("items", "cms"); items.HasKey(x => x.Id); items.Property(x => x.Version).IsConcurrencyToken();
        items.HasOne<ContentCollectionRow>().WithMany().HasForeignKey(x => x.Collection).OnDelete(DeleteBehavior.Restrict);
        items.HasIndex(x => new { x.Collection, x.UpdatedAt, x.Id });
        var revisions = model.Entity<ContentRevisionRow>();
        revisions.ToTable("revisions", "cms"); revisions.HasKey(x => x.Id);
        revisions.Property(x => x.Values).HasColumnType("jsonb");
        revisions.HasOne<ContentItemRow>().WithMany().HasForeignKey(x => x.ItemId).OnDelete(DeleteBehavior.Restrict);
        revisions.HasOne<ContentSchemaRow>().WithMany().HasForeignKey(x => x.SchemaId).OnDelete(DeleteBehavior.Restrict);
        var relations = model.Entity<ContentRelationRow>();
        relations.ToTable("relationships", "cms"); relations.HasKey(x => x.Id);
        relations.HasOne<ContentRevisionRow>().WithMany().HasForeignKey(x => x.RevisionId).OnDelete(DeleteBehavior.Restrict);
        relations.HasOne<ContentItemRow>().WithMany().HasForeignKey(x => x.TargetId).OnDelete(DeleteBehavior.Restrict);
        var grants = model.Entity<ContentGrantRow>();
        grants.ToTable("grants", "cms"); grants.HasKey(x => new { x.Collection, x.RoleId, x.Permission });
        grants.HasOne<ContentCollectionRow>().WithMany().HasForeignKey(x => x.Collection).OnDelete(DeleteBehavior.Restrict);
        var reviews = model.Entity<ContentReviewRow>();
        reviews.ToTable("reviews", "cms"); reviews.HasKey(x => x.Id);
        reviews.HasIndex(x => new { x.RevisionId, x.ReviewerId }).IsUnique();
        reviews.HasOne<ContentRevisionRow>().WithMany().HasForeignKey(x => x.RevisionId).OnDelete(DeleteBehavior.Restrict);
    }
}
