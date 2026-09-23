using TemplateV4.Infrastructure.Cms;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class CmsMarkdownTests
{
    [Fact]
    public void Markdown_preserves_supported_formatting_and_blocks_active_content()
    {
        var html = CmsMarkdown.Render("## Heading\n\n- one\n- two\n\n> quote\n\n```html\n<script>alert(1)</script>\n```\n\n[web](https://example.com) [relative](/blog) [anchor](#part) [mail](mailto:a@example.com)\n\n<script>alert(2)</script>\n\n<javascript:alert%281%29> [bad](javascript:alert%281%29) [encoded](java&#x73;cript:alert%281%29) [data](data:text/html,bad) ![image](https://example.com/a.png)");
        Assert.Contains("<h2>Heading</h2>", html); Assert.Contains("<ul>", html); Assert.Contains("<blockquote>", html);
        Assert.Contains("<pre><code", html); Assert.Contains("href=\"https://example.com\"", html);
        Assert.Contains("href=\"/blog\"", html); Assert.Contains("href=\"#part\"", html);
        Assert.DoesNotContain("<script", html); Assert.DoesNotContain("<img", html);
        Assert.DoesNotContain("href=\"javascript", html); Assert.DoesNotContain("href=\"data:", html);
    }
}
