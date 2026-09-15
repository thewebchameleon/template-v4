using System.Net;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Web_push_is_opt_in_transactional_owner_scoped_and_cancelled_across_browsers()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp); var other = await User(sp); var db = sp.GetRequiredService<FrameworkDb>();
        var config = PushConfiguration(); var push = new WebPushService(db, config, _clock);
        var status = await push.Status(user.Id, default); Assert.False(status.Enabled); Assert.False(status.ShowPreview);
        Assert.False((await push.Preferences(user.Id, new(true, false), default)).IsSuccess);
        var browser = PushRegistration();
        Assert.True((await push.Register(user.Id, browser, default)).IsSuccess);
        Assert.True((await push.Register(user.Id, browser, default)).IsSuccess);
        Assert.False((await push.Register(other.Id, browser, default)).IsSuccess);
        Assert.True((await push.Register(user.Id, PushRegistration(), default)).IsSuccess);
        Assert.Equal(2, await db.Set<WebPushSubscription>().CountAsync());
        db.Notifications.Add(new() { UserId = user.Id, Kind = "notificationSecurity", CreatedAt = _clock.Now }); await db.SaveChangesAsync();
        Assert.Empty(await db.Outbox.Where(x => x.Type == "push.requested.v1").ToArrayAsync());
        Assert.True((await push.Preferences(user.Id, new(true, false), default)).IsSuccess);
        await using (var tx = await db.Database.BeginTransactionAsync())
        {
            db.Notifications.Add(new() { UserId = user.Id, Kind = "notificationSupport", CreatedAt = _clock.Now });
            await db.SaveChangesAsync(); Assert.Equal(2, await db.Outbox.CountAsync(x => x.Type == "push.requested.v1"));
            await tx.RollbackAsync();
        }
        db.ChangeTracker.Clear(); Assert.Empty(await db.Outbox.Where(x => x.Type == "push.requested.v1").ToArrayAsync());
        db.Notifications.Add(new() { UserId = user.Id, Kind = "notificationActionAssigned", CreatedAt = _clock.Now }); await db.SaveChangesAsync();
        var queued = await db.Outbox.AsNoTracking().Where(x => x.Type == "push.requested.v1").ToArrayAsync(); Assert.Equal(2, queued.Length);
        var deliveries = queued.Select(x => JsonSerializer.Deserialize<WebPushDelivery>(x.Payload)!).ToArray();
        using var handler = new PushHandler(); using var http = new HttpClient(handler);
        var sender = new WebPushSender(db, config, http);
        await sender.Send(deliveries[0], default); Assert.Equal(1, handler.Sends);
        await push.Preferences(user.Id, new(false, true), default);
        Assert.Equal(2, await db.Outbox.CountAsync(x => x.Type == "push.requested.v1" && x.CompletedAt != null));
        await sender.Send(deliveries[1], default); Assert.Equal(1, handler.Sends);
        var saved = await push.Status(user.Id, default); Assert.False(saved.Enabled); Assert.True(saved.ShowPreview);
        Assert.False((await push.Status(other.Id, default)).ShowPreview);
        await push.Preferences(user.Id, new(true, false), default);
        handler.Status = HttpStatusCode.Gone;
        await sender.Send(deliveries[0], default);
        Assert.Equal(1, await db.Set<WebPushSubscription>().CountAsync());
        var remaining = await db.Set<WebPushSubscription>().SingleAsync();
        db.Remove(remaining); await db.SaveChangesAsync();
        await sender.Send(deliveries[1], default); Assert.Equal(2, handler.Sends);
    }

    [Theory]
    [InlineData("http://fcm.googleapis.com/send/token")]
    [InlineData("https://localhost/send/token")]
    [InlineData("https://127.0.0.1/send/token")]
    [InlineData("https://fcm.googleapis.com.evil.test/send/token")]
    [InlineData("https://fcm.googleapis.com:8443/send/token")]
    [InlineData("https://user@fcm.googleapis.com/send/token")]
    public void Web_push_rejects_untrusted_destinations(string endpoint)
        => Assert.False(WebPushService.Valid(PushRegistration() with { Endpoint = endpoint }));

    [Fact]
    public void Web_push_previews_default_to_generic_and_cover_notification_categories()
    {
        foreach (var kind in new[] { "notificationSecurity", "notificationSupport", "notificationActionAssigned", "notificationReleaseAvailable", "notificationJobCompleted", "notificationUpdate", "notificationDeletionRequested", "notificationDeletionDeclined" })
        {
            Assert.Equal("You have a new notification", WebPushSender.Message(kind, "en-ZA", false));
            Assert.Equal("Jy het ’n nuwe kennisgewing", WebPushSender.Message(kind, "af-ZA", false));
            Assert.NotEqual(WebPushSender.Message(kind, "en-ZA", false), WebPushSender.Message(kind, "en-ZA", true));
        }
        Assert.Equal("You have a new notification", WebPushSender.Message("futureType", "en-ZA", true));
    }

    private static IConfiguration PushConfiguration()
    {
        var keys = WebPushCrypto.GenerateVapidKeys();
        return new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["WebPush:PublicKey"] = keys.PublicKey,
            ["WebPush:PrivateKey"] = keys.PrivateKey,
            ["WebPush:Subject"] = "mailto:push@example.test"
        }).Build();
    }

    private static WebPushRegistration PushRegistration()
    {
        using var key = ECDiffieHellman.Create(ECCurve.NamedCurves.nistP256); var point = key.ExportParameters(false).Q;
        return new($"https://fcm.googleapis.com/send/{Guid.NewGuid():N}", WebEncoders.Base64UrlEncode([4, .. point.X!, .. point.Y!]), WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(16)));
    }

    private sealed class PushHandler : HttpMessageHandler
    {
        public int Sends { get; private set; }
        public HttpStatusCode Status { get; set; } = HttpStatusCode.Created;
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            Sends++; Assert.Equal(HttpMethod.Post, request.Method);
            Assert.NotNull(request.Headers.Authorization);
            Assert.NotEmpty(await request.Content!.ReadAsByteArrayAsync(ct));
            return new(Status) { Content = new StringContent("") };
        }
    }
}
