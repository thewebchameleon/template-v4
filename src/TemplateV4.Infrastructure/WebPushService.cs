using System.Net;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
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

public sealed class WebPushSubscription
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string EndpointHash { get; set; } = "";
    public string Endpoint { get; set; } = "";
    public string P256dh { get; set; } = "";
    public string Auth { get; set; } = "";
}

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
        await using var tx = await db.Database.BeginTransactionAsync(ct);
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
        await using var tx = await db.Database.BeginTransactionAsync(ct);
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

public sealed class WebPushSender(FrameworkDb db, IConfiguration configuration, HttpClient http)
{
    public async Task Send(WebPushDelivery delivery, CancellationToken ct)
    {
        var target = await (from subscription in db.Set<WebPushSubscription>().AsNoTracking()
                            join user in db.Users on subscription.UserId equals user.Id
                            join profile in db.Profiles on user.Id equals profile.Id
                            join notification in db.Notifications on user.Id equals notification.UserId
                            where subscription.Id == delivery.SubscriptionId && notification.Id == delivery.NotificationId && user.PushEnabled && !profile.Disabled
                            select new { subscription, notification, user.PushShowPreview, profile.Culture }).SingleOrDefaultAsync(ct);
        if (target is null) return;
        if (!WebPushService.Valid(new(target.subscription.Endpoint, target.subscription.P256dh, target.subscription.Auth))) return;
        var body = Message(target.notification.Kind, target.Culture, target.PushShowPreview);
        // Generic notifications contain no category, account identifier, or resource link.
        var payload = JsonSerializer.Serialize(new { title = target.Culture == "af-ZA" ? "Kennisgewings" : "Notifications", body, tag = target.notification.Id.ToString() });
        using var request = WebPushCrypto.CreateRequest(target.subscription.Endpoint, target.subscription.P256dh, target.subscription.Auth, payload,
            configuration["WebPush:Subject"]!, configuration["WebPush:PublicKey"]!, configuration["WebPush:PrivateKey"]!);
        using var response = await http.SendAsync(request, ct);
        if (response.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.Gone)
            await db.Set<WebPushSubscription>().Where(x => x.Id == delivery.SubscriptionId).ExecuteDeleteAsync(ct);
        else response.EnsureSuccessStatusCode();
    }

    public static string Message(string kind, string culture, bool preview)
    {
        var af = culture == "af-ZA";
        if (preview) return kind switch
        {
            "notificationSecurity" => af ? "Jou rekeningsekuriteit het verander" : "Your account security changed",
            "notificationUpdate" => af ? "’n Werkruimte-opdatering is beskikbaar" : "A workspace update is available",
            "notificationJobCompleted" => af ? "Jou agtergrondtaak is voltooi" : "Your background task completed",
            "notificationDeletionRequested" => af ? "Jou verwyderingsversoek is ontvang" : "Your deletion request was received",
            "notificationDeletionDeclined" => af ? "Jou verwyderingsversoek is afgekeur" : "Your deletion request was declined",
            "notificationSupport" => af ? "’n Ondersteuningsopdatering is beskikbaar" : "A support update is available",
            "notificationActionAssigned" => af ? "’n Aksie is aan jou toegeken" : "An action was assigned to you",
            "notificationReleaseAvailable" => af ? "’n Nuwe weergawe is beskikbaar" : "A new release is available",
            _ => af ? "Jy het ’n nuwe kennisgewing" : "You have a new notification"
        };
        return af ? "Jy het ’n nuwe kennisgewing" : "You have a new notification";
    }
}

public static class WebPushCrypto
{
    public static (string PublicKey, string PrivateKey) GenerateVapidKeys()
    {
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var parameters = key.ExportParameters(true);
        return (EncodePoint(parameters.Q), WebEncoders.Base64UrlEncode(parameters.D!));
    }

    public static HttpRequestMessage CreateRequest(string endpoint, string p256dh, string auth, string payload, string subject, string publicKey, string privateKey)
    {
        var destination = new Uri(endpoint);
        var audience = destination.GetLeftPart(UriPartial.Authority);
        var expiration = DateTimeOffset.UtcNow.AddHours(12).ToUnixTimeSeconds();
        var header = WebEncoders.Base64UrlEncode("{\"typ\":\"JWT\",\"alg\":\"ES256\"}"u8.ToArray());
        var claims = WebEncoders.Base64UrlEncode(JsonSerializer.SerializeToUtf8Bytes(new { aud = audience, exp = expiration, sub = subject }));
        var token = $"{header}.{claims}";
        var applicationPoint = DecodePoint(publicKey);
        using var signer = ECDsa.Create(new ECParameters { Curve = ECCurve.NamedCurves.nistP256, D = WebEncoders.Base64UrlDecode(privateKey), Q = applicationPoint });
        var signature = signer.SignData(Encoding.ASCII.GetBytes(token), HashAlgorithmName.SHA256, DSASignatureFormat.IeeeP1363FixedFieldConcatenation);

        var content = Encrypt(payload, p256dh, auth);
        var request = new HttpRequestMessage(HttpMethod.Post, destination) { Content = new ByteArrayContent(content) };
        request.Content.Headers.ContentType = new("application/octet-stream");
        request.Content.Headers.ContentEncoding.Add("aes128gcm");
        request.Headers.Authorization = new AuthenticationHeaderValue("vapid", $"t={token}.{WebEncoders.Base64UrlEncode(signature)}, k={publicKey}");
        request.Headers.TryAddWithoutValidation("TTL", "2419200");
        return request;
    }

    private static byte[] Encrypt(string payload, string p256dh, string auth)
    {
        var receiverPoint = DecodePoint(p256dh);
        using var receiver = ECDiffieHellman.Create(new ECParameters { Curve = ECCurve.NamedCurves.nistP256, Q = receiverPoint });
        using var sender = ECDiffieHellman.Create(ECCurve.NamedCurves.nistP256);
        var senderPoint = sender.ExportParameters(false).Q;
        var senderPublic = PointBytes(senderPoint);
        var receiverPublic = PointBytes(receiverPoint);
        var secret = sender.DeriveRawSecretAgreement(receiver.PublicKey);
        var authSecret = WebEncoders.Base64UrlDecode(auth);
        var keyInfo = Concat("WebPush: info\0"u8.ToArray(), receiverPublic, senderPublic);
        var ikm = Hkdf(secret, authSecret, keyInfo, 32);
        var salt = RandomNumberGenerator.GetBytes(16);
        var key = Hkdf(ikm, salt, "Content-Encoding: aes128gcm\0"u8.ToArray(), 16);
        var nonce = Hkdf(ikm, salt, "Content-Encoding: nonce\0"u8.ToArray(), 12);
        var plaintext = Concat(Encoding.UTF8.GetBytes(payload), [2]);
        var ciphertext = new byte[plaintext.Length];
        var tag = new byte[16];
        using (var aes = new AesGcm(key, tag.Length)) aes.Encrypt(nonce, plaintext, ciphertext, tag);

        var body = new byte[16 + 4 + 1 + senderPublic.Length + ciphertext.Length + tag.Length];
        salt.CopyTo(body, 0);
        System.Buffers.Binary.BinaryPrimitives.WriteUInt32BigEndian(body.AsSpan(16, 4), 4096);
        body[20] = (byte)senderPublic.Length;
        senderPublic.CopyTo(body, 21);
        ciphertext.CopyTo(body, 21 + senderPublic.Length);
        tag.CopyTo(body, 21 + senderPublic.Length + ciphertext.Length);
        return body;
    }

    private static byte[] Hkdf(byte[] input, byte[] salt, byte[] info, int length)
    {
        var output = new byte[length];
        HKDF.DeriveKey(HashAlgorithmName.SHA256, input, output, salt, info);
        return output;
    }

    private static ECPoint DecodePoint(string encoded)
    {
        var point = WebEncoders.Base64UrlDecode(encoded);
        if (point.Length != 65 || point[0] != 4) throw new CryptographicException("Invalid P-256 public key.");
        return new() { X = point[1..33], Y = point[33..65] };
    }

    private static string EncodePoint(ECPoint point) => WebEncoders.Base64UrlEncode(PointBytes(point));
    private static byte[] PointBytes(ECPoint point) => [4, .. point.X!, .. point.Y!];
    private static byte[] Concat(params byte[][] values)
    {
        var result = new byte[values.Sum(x => x.Length)];
        var offset = 0;
        foreach (var value in values) { value.CopyTo(result, offset); offset += value.Length; }
        return result;
    }
}
