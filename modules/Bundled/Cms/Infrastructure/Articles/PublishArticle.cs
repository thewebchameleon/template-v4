using TemplateV4.Application.Cms;
namespace TemplateV4.Infrastructure.Cms;
public sealed partial class CmsStore
{
    public async Task<Result<CmsArticle>> Publish(Guid id, PublishArticle request, CancellationToken ct)
    {
        if (await Access(true, ct) is { } error) return Fail<CmsArticle>(error);
        var result = await contentCms.Transition("articles", id, new(request.Version, request.Published ? "publish" : "unpublish"), ct);
        if (!result.IsSuccess) return Result<CmsArticle>.Fail(result.Error!.Code, result.Error.Kind);
        return await Detail(id, ct);
    }
}
