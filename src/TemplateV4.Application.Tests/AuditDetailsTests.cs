using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using TemplateV4.Infrastructure.Storage;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Audit_failed_login_does_not_impersonate_the_attempted_account()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp);
        var result = await sp.GetRequiredService<AuthService>().Login(new(user.UserName!, "Wrong-password!234", "test"), default);
        Assert.False(result.IsSuccess);
        var db = sp.GetRequiredService<FrameworkDb>();
        var row = await db.Audit.AsNoTracking().SingleAsync(x => x.Action == "auth.login_failed");
        Assert.Null(row.ActorId); Assert.Equal("anonymous", row.ActorType);
        Assert.Equal(user.Id, row.SubjectId); Assert.Equal("failure", row.Outcome);
        Assert.Equal("auth.invalid_credentials", row.FailureCode);
        Assert.DoesNotContain("Wrong-password", System.Text.Json.JsonSerializer.Serialize(row));
    }

    [Fact]
    public async Task Audit_details_capture_changes_snapshots_and_rollback_with_the_operation()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp); var db = sp.GetRequiredService<FrameworkDb>();
        var context = sp.GetRequiredService<BackgroundExecutionContext>();
        context.TraceParent = "00-12345678901234567890123456789012-1234567890123456-01";
        var files = sp.GetRequiredService<FileService>();
        using var content = new MemoryStream("audit test"u8.ToArray());
        var uploaded = (await files.Upload(user.Id, "original.txt", content, default)).Value!;
        Assert.True((await files.Rename(user.Id, uploaded.Id, new("renamed.txt"), default)).IsSuccess);
        var history = sp.GetRequiredService<IAuditHistory>();
        var row = await db.Audit.AsNoTracking().SingleAsync(x => x.SubjectId == uploaded.Id && x.Action == "file.renamed");
        var detail = (await history.Detail(row.Id, default))!;
        Assert.Equal("file", detail.SubjectType); Assert.Equal("user", detail.ActorType);
        Assert.Equal("success", detail.Outcome); Assert.Equal("background", detail.Source);
        Assert.Equal(context.TraceParent, detail.TraceParent); Assert.Equal(1, detail.SchemaVersion);
        Assert.Equal(new AuditChange("name", "original.txt", "renamed.txt"), Assert.Single(detail.Changes));
        await db.Profiles.Where(x => x.Id == user.Id).ExecuteUpdateAsync(x => x.SetProperty(p => p.DisplayName, "New name"));
        await db.Files.Where(x => x.Id == uploaded.Id).ExecuteUpdateAsync(x => x.SetProperty(f => f.Name, "later.txt"));
        detail = (await history.Detail(row.Id, default))!;
        Assert.Equal("Test administrator", detail.Entry.ActorName); Assert.Equal("renamed.txt", detail.Entry.SubjectName);
        foreach (var sort in new[] { "actorName", "subjectName" })
        {
            var list = await history.List(new(SubjectId: uploaded.Id, Sort: sort), default);
            Assert.Contains(list.Items, x => x.Id == row.Id && x.SubjectName == "renamed.txt" && x.ActorName == "Test administrator");
        }
        await using (var tx = await db.Database.BeginTransactionAsync())
        {
            db.Audit.Add(new() { ActorId = user.Id, Action = "test.rolled_back", At = _clock.Now });
            await db.SaveChangesAsync(); await tx.RollbackAsync();
        }
        Assert.False(await db.Audit.AnyAsync(x => x.Action == "test.rolled_back"));
        Assert.Null(await history.Detail(long.MaxValue, default));
        await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO audit.entries (\"Action\", \"At\", \"SubjectId\") VALUES ('legacy.event', {_clock.Now}, {user.Id})");
        var legacy = await db.Audit.AsNoTracking().SingleAsync(x => x.Action == "legacy.event");
        var old = (await history.Detail(legacy.Id, default))!;
        Assert.Null(old.SchemaVersion); Assert.Null(old.Outcome); Assert.Empty(old.Changes);
        Assert.Equal("New name", old.Entry.SubjectName);
    }

    [Fact]
    public async Task Audit_details_http_require_permission_and_return_missing_records_safely()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp); var db = sp.GetRequiredService<FrameworkDb>();
        var session = await sp.GetRequiredService<AuthService>().CreateSession(user, "audit-test", true, default);
        await db.SaveChangesAsync();
        var row = await db.Audit.AsNoTracking().SingleAsync(x => x.Action == "auth.login");
        await using var factory = new ApiFactory(_configuration);
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost"), AllowAutoRedirect = false });
        var path = $"/api/v1/auth/audit/{row.Id}";
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(path)).StatusCode);
        client.DefaultRequestHeaders.Authorization = new("Bearer", session.Access.AccessToken);
        var detail = (await client.GetFromJsonAsync<AuditDetail>(path))!;
        Assert.Equal(row.Id, detail.Entry.Id); Assert.Equal("success", detail.Outcome);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/v1/auth/audit/9223372036854775807")).StatusCode);
    }

    [Fact]
    public async Task Audit_details_are_redacted_when_an_account_is_anonymised()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var reviewer = await User(sp); var user = await User(sp); var db = sp.GetRequiredService<FrameworkDb>();
        var files = sp.GetRequiredService<FileService>();
        using var content = new MemoryStream("private"u8.ToArray());
        var file = (await files.Upload(user.Id, "private-name.txt", content, default)).Value!;
        await files.Rename(user.Id, file.Id, new("private-renamed.txt"), default);
        var row = await db.Audit.AsNoTracking().SingleAsync(x => x.Action == "file.renamed");
        var privacy = sp.GetRequiredService<PrivacyService>();
        await privacy.RequestDeletion(user.Id, default);
        var request = (await privacy.Status(user.Id, default)).Request!;
        Assert.True((await privacy.Review(reviewer.Id, new(request.Id, true), default)).IsSuccess);
        var detail = (await sp.GetRequiredService<IAuditHistory>().Detail(row.Id, default))!;
        Assert.Null(detail.Entry.ActorName); Assert.Null(detail.Entry.SubjectName); Assert.Empty(detail.Changes);
    }
}
