using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application;
using TemplateV4.Application.Cms;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Cms;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
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

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Cms_publishing_isolates_drafts_enforces_permissions_versions_and_runtime_disable()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var editor = await User(sp); var reader = await User(sp);
        var users = sp.GetRequiredService<UserManager<AppUser>>();
        await users.RemoveFromRoleAsync(editor, "Administrator"); await users.RemoveFromRoleAsync(reader, "Administrator");
        var roles = sp.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var role = new IdentityRole<Guid>("CMS editors") { Id = Guid.NewGuid() };
        Assert.True((await roles.CreateAsync(role)).Succeeded);
        Assert.True((await roles.AddClaimAsync(role, new("permission", Permissions.CmsEdit))).Succeeded);
        Assert.True((await users.AddToRoleAsync(editor, role.Name!)).Succeeded);
        var auth = sp.GetRequiredService<AuthService>();
        var token = await auth.CreateSession(editor, "cms-editor", true, default);
        var readerToken = await auth.CreateSession(reader, "cms-reader", true, default);
        await sp.GetRequiredService<FrameworkDb>().SaveChangesAsync();
        await using var factory = new ApiFactory(_configuration);
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost") });
        using var visitor = factory.CreateClient(new() { BaseAddress = new("https://localhost") });
        client.DefaultRequestHeaders.Add("Origin", "https://localhost");
        using var csrf = JsonDocument.Parse(await client.GetStringAsync("/api/v1/auth/csrf"));
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.RootElement.GetProperty("token").GetString());
        client.DefaultRequestHeaders.Authorization = new("Bearer", token.Access.AccessToken);
        var input = new ArticleContent("First <news>", "first-news", "Public summary & details", "## Public body\n\nHello [site](https://example.com)", "News desk");
        var createdResponse = await client.PostAsJsonAsync("/api/v1/auth/cms", new SaveArticle(null, null, input));
        Assert.Equal(HttpStatusCode.OK, createdResponse.StatusCode);
        var draft = (await createdResponse.Content.ReadFromJsonAsync<CmsArticle>())!;
        Assert.True(createdResponse.Headers.CacheControl!.NoStore);
        Assert.Equal(HttpStatusCode.NotFound, (await visitor.GetAsync("/blog/first-news")).StatusCode);
        Assert.DoesNotContain("First", await visitor.GetStringAsync("/blog"));
        Assert.Equal(HttpStatusCode.Unauthorized, (await visitor.GetAsync("/api/v1/auth/cms/" + draft.Id)).StatusCode);
        client.DefaultRequestHeaders.Authorization = new("Bearer", readerToken.Access.AccessToken);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/v1/auth/cms")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync("/api/v1/auth/cms/preview", new PreviewMarkdown("secret"))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync($"/api/v1/auth/cms/{draft.Id}/publish", new PublishArticle(draft.Version, true))).StatusCode);
        client.DefaultRequestHeaders.Authorization = new("Bearer", token.Access.AccessToken);
        var live = (await (await client.PostAsJsonAsync($"/api/v1/auth/cms/{draft.Id}/publish", new PublishArticle(draft.Version, true))).Content.ReadFromJsonAsync<CmsArticle>())!;
        var html = await visitor.GetStringAsync("/blog/first-news");
        Assert.Contains("<h2>Public body</h2>", html); Assert.Contains("First &lt;news&gt;", html);
        Assert.Contains("https://localhost/blog/first-news", html); Assert.Contains("og:title", html); Assert.Contains("article:published_time", html);
        var changed = input with { Title = "PRIVATE TITLE", Excerpt = "PRIVATE EXCERPT", Markdown = "PRIVATE BODY", Author = "PRIVATE AUTHOR" };
        var updated = (await (await client.PostAsJsonAsync("/api/v1/auth/cms", new SaveArticle(live.Id, live.Version, changed))).Content.ReadFromJsonAsync<CmsArticle>())!;
        Assert.True(updated.PendingChanges);
        Assert.DoesNotContain("PRIVATE", await visitor.GetStringAsync("/blog/first-news"));
        Assert.DoesNotContain("PRIVATE", await visitor.GetStringAsync("/blog"));
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync("/api/v1/auth/cms", new SaveArticle(live.Id, live.Version, input))).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync($"/api/v1/auth/cms/{live.Id}/publish", new PublishArticle(live.Version, false))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/v1/auth/cms", new SaveArticle(updated.Id, updated.Version, changed with { Slug = "changed-slug" }))).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync("/api/v1/auth/cms", new SaveArticle(null, null, input))).StatusCode);
        var republished = (await (await client.PostAsJsonAsync($"/api/v1/auth/cms/{updated.Id}/publish", new PublishArticle(updated.Version, true))).Content.ReadFromJsonAsync<CmsArticle>())!;
        Assert.Equal(live.PublishedAt!.Value.UtcTicks / 10, republished.PublishedAt!.Value.UtcTicks / 10); // PostgreSQL stores microseconds.
        Assert.False(republished.PendingChanges);
        Assert.Contains("PRIVATE BODY", await visitor.GetStringAsync("/blog/first-news"));
        var unpublished = (await (await client.PostAsJsonAsync($"/api/v1/auth/cms/{updated.Id}/publish", new PublishArticle(republished.Version, false))).Content.ReadFromJsonAsync<CmsArticle>())!;
        Assert.Equal(HttpStatusCode.NotFound, (await visitor.GetAsync("/blog/first-news")).StatusCode);
        Assert.DoesNotContain("PRIVATE", await visitor.GetStringAsync("/blog"));
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/v1/auth/cms", new SaveArticle(unpublished.Id, unpublished.Version, changed with { Slug = "changed-slug" }))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync($"/api/v1/auth/cms/{updated.Id}/publish", new PublishArticle(unpublished.Version, true))).StatusCode);
        var db = sp.GetRequiredService<FrameworkDb>();
        await db.RuntimeModules.Where(x => x.Id == "cms").ExecuteUpdateAsync(x => x.SetProperty(r => r.Enabled, false));
        Assert.Equal(HttpStatusCode.NotFound, (await visitor.GetAsync("/blog")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await visitor.GetAsync("/blog/first-news")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/v1/auth/cms")).StatusCode);
        Assert.True(await db.Set<ArticleRow>().AnyAsync(x => x.Id == draft.Id));
        await db.RuntimeModules.Where(x => x.Id == "cms").ExecuteUpdateAsync(x => x.SetProperty(r => r.Enabled, true));
        Assert.Equal(HttpStatusCode.OK, (await visitor.GetAsync("/blog/first-news")).StatusCode);
        var audit = await db.Audit.Where(x => x.SubjectId == draft.Id).ToArrayAsync();
        Assert.Equal(6, audit.Length); Assert.All(audit, x => Assert.DoesNotContain("PRIVATE", x.ChangesJson ?? ""));
        client.DefaultRequestHeaders.Remove("X-CSRF-TOKEN");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync("/api/v1/auth/cms", new SaveArticle(null, null, input with { Slug = "csrf-test" }))).StatusCode);
    }

    [Fact]
    public async Task Cms_parallel_saves_and_slug_creation_have_one_winner_and_atomic_audit()
    {
        await using var setup = _services.CreateAsyncScope(); var sp = setup.ServiceProvider;
        var user = await User(sp);
        async Task<Result<CmsArticle>> Save(SaveArticle request)
        {
            await using var scope = _services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<BackgroundExecutionContext>();
            context.ActorId = user.Id; context.Permissions = new HashSet<string> { Permissions.CmsEdit };
            return await scope.ServiceProvider.GetRequiredService<ICms>().Save(request, default);
        }
        var content = new ArticleContent("Title", "race", "Excerpt", "Body", "Author");
        var created = await Task.WhenAll(Save(new(null, null, content)), Save(new(null, null, content)));
        var article = Assert.Single(created, x => x.IsSuccess).Value!;
        Assert.Equal("cms.slug_taken", Assert.Single(created, x => !x.IsSuccess).Error!.Code);
        var changes = await Task.WhenAll(Save(new(article.Id, article.Version, content with { Title = "One" })), Save(new(article.Id, article.Version, content with { Title = "Two" })));
        Assert.Single(changes, x => x.IsSuccess); Assert.Equal("concurrency.conflict", Assert.Single(changes, x => !x.IsSuccess).Error!.Code);
        var db = sp.GetRequiredService<FrameworkDb>();
        Assert.Equal(2, await db.Audit.CountAsync(x => x.SubjectId == article.Id));
        Assert.Equal(1, await db.Set<ArticleRow>().CountAsync());
    }
}



