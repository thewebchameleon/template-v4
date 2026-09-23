using System.Text.Json;
using TemplateV4.Application.Cms;
namespace TemplateV4.Infrastructure.Cms;
public sealed partial class CmsStore
{
    public async Task<Result<CmsArticle>> Save(SaveArticle request, CancellationToken ct)
    {
        if (await Access(true, ct) is { } error) return Fail<CmsArticle>(error);
        if (request.Content is null) return Result<CmsArticle>.Fail("validation.failed", ErrorKind.Validation);
        var values = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(JsonSerializer.Serialize(request.Content, Json), Json)!;
        if (request.Id is { } id)
        {
            var existing = await contentCms.Item("articles", id, ct);
            if (!existing.IsSuccess) return Result<CmsArticle>.Fail(existing.Error!.Code, existing.Error.Kind);
            // A legacy article client cannot edit fields added through the schema builder.
            foreach (var field in existing.Value!.Values) values.TryAdd(field.Key, field.Value);
        }
        var result = await contentCms.Save("articles", new(request.Id, request.Version, values), ct);
        if (!result.IsSuccess) return Result<CmsArticle>.Fail(result.Error!.Code, result.Error.Kind);
        return await Detail(result.Value!.Id, ct);
    }
}
