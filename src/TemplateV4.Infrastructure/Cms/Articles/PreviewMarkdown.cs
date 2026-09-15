using TemplateV4.Application.Cms;

namespace TemplateV4.Infrastructure.Cms;

public sealed partial class CmsStore
{
    public async Task<Result<MarkdownPreview>> Preview(PreviewMarkdown request, CancellationToken ct)
    {
        if (await Access(true, ct) is { } error) return Fail<MarkdownPreview>(error);
        return request.Markdown is null or { Length: > 100000 }
            ? Result<MarkdownPreview>.Fail("validation.failed", ErrorKind.Validation)
            : Result<MarkdownPreview>.Success(new(CmsMarkdown.Render(request.Markdown)));
    }
}
