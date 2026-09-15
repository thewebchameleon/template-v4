using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure;

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
