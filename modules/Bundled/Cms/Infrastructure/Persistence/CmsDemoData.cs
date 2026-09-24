using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Cms;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Cms;

namespace TemplateV4.Infrastructure.Persistence;

public sealed class CmsDemoData(CmsDb db) : IDemoDataContributor
{
    public string ModuleId => "cms";
    public int Order => 100;

    public async Task Seed(CancellationToken ct)
    {
        if (await db.Set<ContentItemRow>().AnyAsync(x => x.Id == DemoDataIds.Article, ct) ||
            await db.Set<ArticleRow>().AnyAsync(x => x.Slug == "demo-workspace-overview", ct)) return;
        var collection = await db.Set<ContentCollectionRow>().SingleAsync(x => x.Key == "articles", ct);
        if (collection.Version != new Guid("459596de-3500-4b8a-8b7a-36deed8b62b5")) return;
        var now = DateTimeOffset.UtcNow;
        var article = new ArticleContent("Explore the demo workspace", "demo-workspace-overview",
            "A short tour of the sample content and workflows.",
            "# Welcome to the demo\n\nExplore CRM records, support tickets, invoices and module settings. Sample people and companies are fictional.",
            "Demo Team");
        var json = JsonSerializer.Serialize(article, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        var revisionId = Guid.NewGuid();
        db.Set<ContentItemRow>().Add(new()
        {
            Id = DemoDataIds.Article, Collection = "articles", DraftRevisionId = revisionId,
            PublishedRevisionId = revisionId, Title = article.Title, State = "Published",
            UpdatedAt = now, PublishedAt = now, PublishedUpdatedAt = now
        });
        db.Set<ContentRevisionRow>().Add(new()
        {
            Id = revisionId, ItemId = DemoDataIds.Article, SchemaId = collection.Version,
            AuthorId = DemoDataIds.Participant, Values = json, CreatedAt = now
        });
        db.Set<ArticleRow>().Add(new()
        {
            Id = DemoDataIds.Article, Slug = article.Slug, Title = article.Title,
            Draft = json, PublishedContent = json, Published = true,
            UpdatedAt = now, PublishedAt = now, PublishedUpdatedAt = now
        });
        await db.SaveChangesAsync(ct);
    }
}
