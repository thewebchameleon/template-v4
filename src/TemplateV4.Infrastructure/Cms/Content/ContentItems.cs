using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Cms;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Cms;

public sealed partial class ContentStore
{
    private async Task<ContentItem> ItemView(ContentItemRow row, CancellationToken ct)
    {
        var revision = await db.Set<ContentRevisionRow>().SingleAsync(x => x.Id == row.DraftRevisionId, ct);
        var decisions = await db.Set<ContentReviewRow>().Where(x => x.RevisionId == revision.Id)
            .Select(x => new ContentDecision(x.ReviewerId, x.State, x.Comment)).ToArrayAsync(ct);
        var actions = (await Actions(row.Collection, ct)).ToList();
        if (context.ActorId is { } actor && decisions.Any(x => x.ReviewerId == actor && x.State == "Pending") &&
            actor != revision.AuthorId && actions.Contains(Permissions.CmsReview)) actions.Add("review-assigned");
        return new(row.Id, row.Collection, row.Version, revision.Id, row.Title, row.State, row.PublishedRevisionId != null,
            row.PublishedRevisionId != null && row.PublishedRevisionId != revision.Id, row.UpdatedAt, row.PublishedAt,
            Decode<Dictionary<string, JsonElement>>(revision.Values), decisions, actions.ToArray());
    }
    public async Task<Result<ContentItem>> Item(string key, Guid id, CancellationToken ct)
    {
        if (!await Enabled(ct)) return Missing<ContentItem>();
        if (!await Readable(key, ct)) return Denied<ContentItem>();
        var row = await db.Set<ContentItemRow>().SingleOrDefaultAsync(x => x.Id == id && x.Collection == key, ct);
        return row is null ? Missing<ContentItem>() : Result<ContentItem>.Success(await ItemView(row, ct));
    }
    public async Task<Result<ContentItem>> Save(string key, SaveContentItem request, CancellationToken ct)
    {
        if (!await Enabled(ct)) return Missing<ContentItem>();
        await using var tx = await db.Database.BeginTransactionAsync(ct); await MutationLock(ct);
        if (!await RuntimeEnabled(ct)) return Missing<ContentItem>();
        if (!await Can(key, Permissions.CmsWrite, ct)) return Denied<ContentItem>();
        var collection = await Find(key, ct); if (collection is null) return Missing<ContentItem>();
        if (request.Id.HasValue != request.Version.HasValue || request.Values is null || Encode(request.Values).Length > 500000) return Invalid<ContentItem>();
        var row = request.Id is { } id ? await db.Set<ContentItemRow>().SingleOrDefaultAsync(x => x.Id == id && x.Collection == key, ct) : new ContentItemRow { Collection = key };
        if (row is null) return Missing<ContentItem>();
        if (request.Id.HasValue && row.Version != request.Version) return Conflict<ContentItem>();
        var fields = Decode<ContentField[]>(collection.Fields);
        var revision = new ContentRevisionRow { ItemId = row.Id, SchemaId = collection.Version,
            AuthorId = context.ActorId, Values = Encode(request.Values), CreatedAt = time.GetUtcNow() };
        var relations = new List<ContentRelationRow>();
        if (!await ValidValues(fields, request.Values, revision.Id, relations, "", ct)) return Invalid<ContentItem>();
        if (key == "articles" && await ArticleError(row, request.Values, ct) is { } articleError)
            return Result<ContentItem>.Fail(articleError, articleError == "cms.slug_taken" ? ErrorKind.Conflict : ErrorKind.Validation);
        if (request.Id.HasValue) await CloseReviews(row.DraftRevisionId, ct);
        else db.Add(row);
        row.Title = request.Values.TryGetValue("title", out var title) && title.ValueKind == JsonValueKind.String ? title.GetString()! :
            request.Values.TryGetValue("name", out var name) && name.ValueKind == JsonValueKind.String ? name.GetString()! : row.Id.ToString();
        row.Title = row.Title.Length > 200 ? row.Title[..200] : row.Title;
        row.DraftRevisionId = revision.Id; row.State = "Draft"; row.Version = Guid.NewGuid(); row.UpdatedAt = time.GetUtcNow();
        db.Add(revision); db.AddRange(relations);
        await ProjectArticle(row, revision, false, ct);
        Audit(row.Id, "cms.item.saved"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<ContentItem>.Success(await ItemView(row, ct));
    }
    private async Task<bool> ValidValues(ContentField[] fields, Dictionary<string, JsonElement> values, Guid revision,
        List<ContentRelationRow> relations, string path, CancellationToken ct)
    {
        if (values.Keys.Any(k => !fields.Any(f => f.Key == k))) return false;
        foreach (var field in fields)
        {
            if (!values.TryGetValue(field.Key, out var value) || value.ValueKind == JsonValueKind.Null)
            { if (field.Required) return false; else continue; }
            var entries = field.Multiple ? value.ValueKind == JsonValueKind.Array ? value.EnumerateArray().ToArray() : null : new[] { value };
            if (entries is null || entries.Length > 200 || field.Required && entries.Length == 0) return false;
            for (var index = 0; index < entries.Length; index++)
            {
                var entry = entries[index]; var location = path + field.Key + (field.Multiple ? "/" + index : "");
                switch (field.Type)
                {
                    case "text": case "richText": case "select": case "date":
                        if (entry.ValueKind != JsonValueKind.String || field.Required && string.IsNullOrWhiteSpace(entry.GetString())) return false;
                        if (field.Type == "date" && !DateOnly.TryParseExact(entry.GetString(), "yyyy-MM-dd", out _)) return false;
                        if (field.Type == "select" && !(field.Options ?? []).Contains(entry.GetString())) return false;
                        break;
                    case "number": if (entry.ValueKind != JsonValueKind.Number || !entry.TryGetDecimal(out _)) return false; break;
                    case "boolean": if (entry.ValueKind is not (JsonValueKind.True or JsonValueKind.False)) return false; break;
                    case "file": case "image":
                        if (entry.ValueKind != JsonValueKind.String || !entry.TryGetGuid(out var fileId) ||
                            !await files.Available(context.ActorId!.Value, fileId, field.Type == "image", ct)) return false;
                        break;
                    case "group":
                        if (entry.ValueKind != JsonValueKind.Object || !await ValidValues(field.Fields ?? [], Decode<Dictionary<string, JsonElement>>(entry.GetRawText()), revision, relations, location + "/", ct)) return false;
                        break;
                    case "reference":
                        if (entry.ValueKind != JsonValueKind.Object || !entry.TryGetProperty("id", out var reference) || reference.ValueKind != JsonValueKind.String || !reference.TryGetGuid(out var target) ||
                            !await Readable(field.Collection!, ct) || !await db.Set<ContentItemRow>().AnyAsync(x => x.Id == target && x.Collection == field.Collection, ct)) return false;
                        var extra = Decode<Dictionary<string, JsonElement>>(entry.GetRawText()); extra.Remove("id");
                        if (!await ValidValues(field.Fields ?? [], extra, revision, relations, location + "/", ct)) return false;
                        relations.Add(new() { RevisionId = revision, TargetId = target, Path = location });
                        break;
                }
            }
        }
        return true;
    }
    private async Task<string?> ArticleError(ContentItemRow row, Dictionary<string, JsonElement> values, CancellationToken ct)
    {
        string Text(string key) => values.TryGetValue(key, out var value) && value.ValueKind == JsonValueKind.String ? value.GetString()! : "";
        var slug = Text("slug");
        if (new[] { "title", "slug", "excerpt", "author", "markdown" }.Any(key => string.IsNullOrWhiteSpace(Text(key))) ||
            Text("title").Length > 200 || slug.Length > 160 || !System.Text.RegularExpressions.Regex.IsMatch(slug, "^[a-z0-9]+(?:-[a-z0-9]+)*$") ||
            Text("excerpt").Length > 500 || Text("author").Length > 120 || Text("markdown").Length > 100000) return "validation.failed";
        if (await db.Set<ArticleRow>().AnyAsync(x => x.Id != row.Id && x.Slug == slug, ct)) return "cms.slug_taken";
        return await db.Set<ArticleRow>().AnyAsync(x => x.Id == row.Id && x.PublishedAt != null && x.Slug != slug, ct) ? "cms.slug_locked" : null;
    }
    private async Task ProjectArticle(ContentItemRow row, ContentRevisionRow revision, bool publishing, CancellationToken ct)
    {
        if (row.Collection != "articles") return;
        var article = await db.Set<ArticleRow>().SingleOrDefaultAsync(x => x.Id == row.Id, ct);
        if (article is null) { article = new() { Id = row.Id }; db.Add(article); }
        var content = Decode<ArticleContent>(revision.Values);
        article.Title = content.Title; article.Slug = content.Slug; article.Draft = Encode(content);
        article.Version = row.Version; article.UpdatedAt = row.UpdatedAt; article.Published = row.PublishedRevisionId != null;
        article.PublishedAt = row.PublishedAt; article.PublishedUpdatedAt = row.PublishedUpdatedAt;
        if (publishing) article.PublishedContent = article.Draft;
    }
    private async Task CloseReviews(Guid revisionId, CancellationToken ct)
    {
        var reviews = await db.Set<ContentReviewRow>().Where(x => x.RevisionId == revisionId).ToArrayAsync(ct);
        foreach (var review in reviews)
        {
            if (review.State == "Pending") review.State = "Cancelled";
            await actionItems.ResolveReview("Cms", review.Id, context.ActorId!.Value, ct);
        }
    }
}
