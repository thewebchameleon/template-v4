using Markdig;
using Markdig.Renderers;
using Markdig.Renderers.Html;
using Markdig.Renderers.Html.Inlines;
using Markdig.Syntax.Inlines;

namespace TemplateV4.Infrastructure.Cms;

public static class CmsMarkdown
{
    private static readonly MarkdownPipeline Pipeline = new MarkdownPipelineBuilder().DisableHtml().Build();
    public static string Render(string markdown)
    {
        using var writer = new StringWriter();
        var renderer = new HtmlRenderer(writer);
        Pipeline.Setup(renderer);
        renderer.ObjectRenderers.Replace<LinkInlineRenderer>(new SafeLinkRenderer());
        renderer.ObjectRenderers.Replace<AutolinkInlineRenderer>(new PlainAutolinkRenderer());
        renderer.Render(Markdown.Parse(markdown, Pipeline));
        return writer.ToString();
    }
    private sealed class PlainAutolinkRenderer : HtmlObjectRenderer<AutolinkInline>
    {
        protected override void Write(HtmlRenderer renderer, AutolinkInline link) => renderer.WriteEscape(link.Url);
    }
    private sealed class SafeLinkRenderer : HtmlObjectRenderer<LinkInline>
    {
        protected override void Write(HtmlRenderer renderer, LinkInline link)
        {
            var url = link.Url ?? "";
            // No image loading in v1. Only explicit web/mail links and same-site paths/fragments.
            var safe = !url.Any(char.IsControl) && !url.Contains('\\') &&
                ((url.StartsWith('/') && !url.StartsWith("//", StringComparison.Ordinal)) || url.StartsWith('#') ||
                 Uri.TryCreate(url, UriKind.Absolute, out var uri) && uri.Scheme is "http" or "https" or "mailto");
            if (!link.IsImage && safe)
            {
                renderer.Write("<a href=\"").WriteEscape(url).Write("\" rel=\"nofollow noopener noreferrer\">");
                renderer.WriteChildren(link); renderer.Write("</a>");
            }
            else renderer.WriteChildren(link);
        }
    }
}

