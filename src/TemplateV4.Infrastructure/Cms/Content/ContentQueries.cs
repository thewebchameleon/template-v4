using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TemplateV4.Application.Cms;
using TemplateV4.Application.Users;

namespace TemplateV4.Infrastructure.Cms;

public sealed partial class ContentStore
{
    private static bool ValidQuery(ContentQuery q, ContentField[] fields) => q.PageNumber is >= 1 and <= 10000 && q.PageSize is 5 or 10 or 25 or 50 &&
        q.Search.Length <= 200 && q.Direction is "asc" or "desc" && q.State is "all" or "Draft" or "InReview" or "Approved" or "Published" &&
        (q.Sort is "title" or "updatedAt" or "state" or "published" || fields.Any(x => x.Key == q.Sort && !x.Multiple && x.Type is "text" or "number" or "date" or "boolean" or "select"));
    private static bool ValidFilter(string? filter, ContentField[] fields)
    {
        if (filter is null) return true;
        if (filter.Length > 4000) return false;
        try
        {
            var values = Decode<Dictionary<string, JsonElement>>(filter);
            return values is not null && values.Count <= 20 && values.All(v => fields.Any(f => f.Key == v.Key && !f.Multiple && f.Type is "text" or "number" or "boolean" or "date" or "select") && v.Value.ValueKind is not (JsonValueKind.Array or JsonValueKind.Object));
        }
        catch (JsonException) { return false; }
    }
    private IQueryable<ContentItemRow> Query(string key, ContentQuery q, ContentField[] fields, bool published, bool page = false)
    {
        var revisionKey = published ? "PublishedRevisionId" : "DraftRevisionId";
        var order = q.Sort switch
        {
            "title" => published ? "coalesce(r.\"Values\" ->> 'title', r.\"Values\" ->> 'name', i.\"Id\"::text)" : "i.\"Title\"",
            "updatedAt" => published ? "i.\"PublishedUpdatedAt\"" : "i.\"UpdatedAt\"",
            "state" => "i.\"State\"", "published" => "i.\"PublishedRevisionId\" IS NOT NULL",
            _ => fields.Single(x => x.Key == q.Sort).Type switch
            {
                "number" => "(r.\"Values\" ->> @sort)::numeric", "boolean" => "(r.\"Values\" ->> @sort)::boolean",
                _ => "r.\"Values\" ->> @sort"
            }
        };
        // Only fixed SQL fragments are composed; collection, field names, filters, and search are parameters.
        var sql = $"SELECT i.* FROM cms.items i JOIN cms.revisions r ON r.\"Id\" = i.\"{revisionKey}\" " +
            "WHERE i.\"Collection\" = @collection AND (@search = '' OR strpos(lower(coalesce(r.\"Values\" ->> 'title', r.\"Values\" ->> 'name', i.\"Id\"::text)), lower(@search)) > 0) " +
            "AND r.\"Values\" @> @filter::jsonb " + (published ? "" : "AND (@state = 'all' OR i.\"State\" = @state) ") +
            $"ORDER BY ({order}) {(q.Direction == "asc" ? "ASC" : "DESC")} NULLS LAST, i.\"Id\"" + (page ? " LIMIT @limit OFFSET @offset" : "");
        return db.Set<ContentItemRow>().FromSqlRaw(sql, new NpgsqlParameter("collection", key), new NpgsqlParameter("search", q.Search),
            new NpgsqlParameter("filter", q.Filter ?? "{}"), new NpgsqlParameter("state", q.State), new NpgsqlParameter("sort", q.Sort),
            new NpgsqlParameter("limit", q.PageSize), new NpgsqlParameter("offset", (q.PageNumber - 1) * q.PageSize)).AsNoTracking();
    }
    public async Task<Result<Page<ContentItemSummary>>> Items(string key, ContentQuery query, CancellationToken ct)
    {
        if (!await Enabled(ct)) return Missing<Page<ContentItemSummary>>();
        if (!await Readable(key, ct)) return Denied<Page<ContentItemSummary>>();
        var collection = await Find(key, ct); if (collection is null) return Missing<Page<ContentItemSummary>>();
        var fields = Decode<ContentField[]>(collection.Fields);
        if (!ValidQuery(query, fields) || !ValidFilter(query.Filter, fields)) return Invalid<Page<ContentItemSummary>>();
        var source = Query(key, query, fields, false); var total = await source.CountAsync(ct);
        var rows = await Query(key, query, fields, false, true).ToArrayAsync(ct);
        return Result<Page<ContentItemSummary>>.Success(new(rows.Select(x => new ContentItemSummary(x.Id, x.Title, x.State, x.PublishedRevisionId != null, x.UpdatedAt)).ToArray(), total, query.PageNumber, query.PageSize));
    }
    private static bool PublishedAccess(ContentCollectionRow collection, ContentReadAccess access) =>
        access.PublicOnly ? collection.PublicRead : access.Collections.Contains(collection.Key);
    public async Task<Result<Page<PublishedContent>>> Published(string key, ContentQuery query, string? fields, int expand, ContentReadAccess access, CancellationToken ct)
    {
        if (!await Enabled(ct)) return Missing<Page<PublishedContent>>();
        var collection = await Find(key, ct);
        if (collection is null || !PublishedAccess(collection, access)) return Missing<Page<PublishedContent>>();
        var schema = Decode<ContentField[]>(collection.Fields);
        if (!ValidQuery(query, schema) || !ValidFilter(query.Filter, schema) || query.State != "all" || query.Sort is "state" or "published" || !ValidSelection(fields, schema, expand)) return Invalid<Page<PublishedContent>>();
        var source = Query(key, query, schema, true); var total = await source.CountAsync(ct);
        var rows = await Query(key, query, schema, true, true).ToArrayAsync(ct);
        var result = new List<PublishedContent>();
        foreach (var row in rows) result.Add(await PublishedView(row, fields, expand, access, ct));
        return Result<Page<PublishedContent>>.Success(new(result, total, query.PageNumber, query.PageSize));
    }
    public async Task<Result<PublishedContent>> PublishedItem(string key, Guid id, string? fields, int expand, ContentReadAccess access, CancellationToken ct)
    {
        if (!await Enabled(ct)) return Missing<PublishedContent>();
        var collection = await Find(key, ct);
        if (collection is null || !PublishedAccess(collection, access)) return Missing<PublishedContent>();
        if (!ValidSelection(fields, Decode<ContentField[]>(collection.Fields), expand)) return Invalid<PublishedContent>();
        var row = await db.Set<ContentItemRow>().SingleOrDefaultAsync(x => x.Id == id && x.Collection == key && x.PublishedRevisionId != null, ct);
        return row is null ? Missing<PublishedContent>() : Result<PublishedContent>.Success(await PublishedView(row, fields, expand, access, ct));
    }
    private static bool ValidSelection(string? fields, ContentField[] schema, int expand) => expand is >= 0 and <= 1 &&
        (fields is null || fields.Split(',').All(key => schema.Any(x => x.Key == key)));
    private async Task<PublishedContent> PublishedView(ContentItemRow row, string? fields, int expand, ContentReadAccess access, CancellationToken ct)
    {
        var revision = await db.Set<ContentRevisionRow>().AsNoTracking().SingleAsync(x => x.Id == row.PublishedRevisionId, ct);
        var schema = await db.Set<ContentSchemaRow>().AsNoTracking().SingleAsync(x => x.Id == revision.SchemaId, ct);
        var values = Decode<Dictionary<string, JsonElement>>(revision.Values);
        if (fields is not null) values = values.Where(x => fields.Split(',').Contains(x.Key)).ToDictionary();
        await FilterPublished(Decode<ContentField[]>(schema.Fields), values, expand, access, ct);
        return new(row.Id, row.Collection, row.PublishedAt!.Value, row.PublishedUpdatedAt!.Value, values);
    }
    private async Task FilterPublished(ContentField[] fields, Dictionary<string, JsonElement> values, int expand, ContentReadAccess access, CancellationToken ct)
    {
        foreach (var field in fields)
        {
            if (!values.TryGetValue(field.Key, out var value) || value.ValueKind == JsonValueKind.Null) continue;
            var entries = field.Multiple ? value.EnumerateArray().ToArray() : new[] { value };
            var output = new List<JsonElement>();
            foreach (var entry in entries)
            {
                if (field.Type is "reference" or "group")
                {
                    var data = Decode<Dictionary<string, JsonElement>>(entry.GetRawText());
                    if (field.Type == "reference")
                    {
                        var targetCollection = await Find(field.Collection!, ct);
                        if (targetCollection is null || !PublishedAccess(targetCollection, access)) continue;
                        var id = data["id"].GetGuid();
                        var target = await db.Set<ContentItemRow>().SingleOrDefaultAsync(x => x.Id == id && x.PublishedRevisionId != null, ct);
                        if (target is null) continue;
                        if (expand > 0) data["item"] = JsonSerializer.SerializeToElement(await PublishedView(target, null, 0, access, ct), Json);
                    }
                    await FilterPublished(field.Fields ?? [], data, expand, access, ct);
                    output.Add(JsonSerializer.SerializeToElement(data, Json));
                }
                else if (field.Type is "file" or "image")
                {
                    // A CMS publication does not implicitly make an organisation file public.
                    var id = entry.GetGuid();
                    if (await files.Public(id, ct)) output.Add(entry);
                }
                else output.Add(entry);
            }
            values[field.Key] = field.Multiple ? JsonSerializer.SerializeToElement(output, Json) : output.Count == 0 ? JsonSerializer.SerializeToElement<object?>(null) : output[0];
        }
    }
}
