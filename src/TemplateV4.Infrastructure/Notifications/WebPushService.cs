using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure;

public sealed record WebPushRegistration(string Endpoint, string P256dh, string Auth);
public sealed record WebPushStatus(bool Enabled, bool ShowPreview, string? PublicKey);
public sealed record WebPushPreference(bool Enabled, bool ShowPreview);
public sealed record WebPushDelivery(Guid NotificationId, Guid SubscriptionId);

public sealed class WebPushService(FrameworkDb db, IConfiguration configuration, TimeProvider time)
{
    public async Task<WebPushStatus> Status(Guid actor, CancellationToken ct)
    {
        var user = await db.Users.AsNoTracking().SingleAsync(x => x.Id == actor, ct);
        return new(user.PushEnabled, user.PushShowPreview, Configured ? configuration["WebPush:PublicKey"] : null);
    }

    private bool Configured => !string.IsNullOrWhiteSpace(configuration["WebPush:PublicKey"])
        && !string.IsNullOrWhiteSpace(configuration["WebPush:PrivateKey"])
        && !string.IsNullOrWhiteSpace(configuration["WebPush:Subject"]);

    // Only the browser vendors' HTTPS push services are outbound destinations. Never follow redirects.
    public static bool Valid(WebPushRegistration request)
    {
        if (request.Endpoint is not { Length: > 0 and <= 2048 } || !Uri.TryCreate(request.Endpoint, UriKind.Absolute, out var uri)
            || uri.Scheme != "https" || !uri.IsDefaultPort || uri.UserInfo.Length != 0 || uri.Fragment.Length != 0
            || !(uri.Host == "fcm.googleapis.com" || uri.Host == "updates.push.services.mozilla.com"
                || uri.Host == "web.push.apple.com" || uri.Host.EndsWith(".notify.windows.com", StringComparison.Ordinal))) return false;
        try
        {
            if (request.P256dh is not { Length: 87 } || request.Auth is not { Length: 22 }) return false;
            var key = WebEncoders.Base64UrlDecode(request.P256dh);
            if (key.Length != 65 || key[0] != 4 || WebEncoders.Base64UrlDecode(request.Auth).Length != 16) return false;
            using var curve = ECDiffieHellman.Create(new ECParameters { Curve = ECCurve.NamedCurves.nistP256, Q = new() { X = key[1..33], Y = key[33..65] } });
            return true;
        }
        catch (Exception exception) when (exception is FormatException or CryptographicException or ArgumentException) { return false; }
    }

    public async Task<Result<Unit>> Register(Guid actor, WebPushRegistration request, CancellationToken ct)
    {
        if (!Valid(request)) return Result.Fail("validation.failed", ErrorKind.Validation);
        if (!Configured) return Result.Fail("feature.disabled", ErrorKind.Conflict);
        await using var tx = await db.Session.BeginTransactionAsync(ct);
        // Registration and preference changes for the same account serialize.
        await Lock(actor, ct);
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(request.Endpoint)));
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({hash}, 0))", ct);
        var existing = await db.Set<WebPushSubscription>().SingleOrDefaultAsync(x => x.EndpointHash == hash, ct);
        // An endpoint belongs to one account. Do not silently transfer another account's subscription.
        if (existing is not null && existing.UserId != actor) return Result.Fail("resource.exists", ErrorKind.Conflict);
        if (existing is null)
        {
            if (await db.Set<WebPushSubscription>().CountAsync(x => x.UserId == actor, ct) >= 20) return Result.Fail("validation.failed", ErrorKind.Validation);
            db.Add(new WebPushSubscription { UserId = actor, EndpointHash = hash, Endpoint = request.Endpoint, P256dh = request.P256dh, Auth = request.Auth });
        }
        else { existing.P256dh = request.P256dh; existing.Auth = request.Auth; }
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Result.Success();
    }

    public async Task<Result<Unit>> Preferences(Guid actor, WebPushPreference request, CancellationToken ct)
    {
        if (request.Enabled && !Configured) return Result.Fail("feature.disabled", ErrorKind.Conflict);
        await using var tx = await db.Session.BeginTransactionAsync(ct);
        await Lock(actor, ct);
        if (request.Enabled && !await db.Set<WebPushSubscription>().AnyAsync(x => x.UserId == actor, ct)) return Result.Fail("validation.failed", ErrorKind.Validation);
        var previous = await db.Users.AsNoTracking().SingleAsync(x => x.Id == actor, ct);
        await db.Users.Where(x => x.Id == actor).ExecuteUpdateAsync(x => x.SetProperty(u => u.PushEnabled, request.Enabled).SetProperty(u => u.PushShowPreview, request.ShowPreview), ct);
        if (!request.Enabled)
            await db.Database.ExecuteSqlInterpolatedAsync($"""
                UPDATE messaging.outbox o SET "CompletedAt" = {time.GetUtcNow()}
                FROM app.web_push_subscriptions s
                WHERE s."UserId" = {actor} AND o."Type" = 'push.requested.v1'
                    AND o."Payload"::jsonb ->> 'SubscriptionId' = s."Id"::text AND o."CompletedAt" IS NULL;
                """, ct);
        db.Audit.Add(new()
        {
            ActorId = actor,
            SubjectId = actor,
            Action = "notifications.push_preferences_changed",
            At = time.GetUtcNow(),
            ChangesJson = AuditCapture.Changes(
            new AuditChange("pushEnabled", previous.PushEnabled.ToString(), request.Enabled.ToString()),
            new AuditChange("pushShowPreview", previous.PushShowPreview.ToString(), request.ShowPreview.ToString()))
        });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result.Success();
    }

    private Task<int> Lock(Guid actor, CancellationToken ct) => db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({"push:" + actor}, 0))", ct);
}
