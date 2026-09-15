using System.Text.Json;
using TemplateV4.Application;

namespace TemplateV4.Infrastructure.Persistence;

public sealed class EventOutbox(FrameworkDb db, IExecutionContext context, TimeProvider time, IntegrationContracts contracts) : IEventOutbox
{
    public void Add<T>(T message) where T : IIntegrationEvent
    {
        // Explicit stable names form the wire contract. Never deserialize arbitrary CLR types.
        var type = contracts.Name<T>();
        db.Outbox.Add(new()
        {
            Type = type,
            Payload = JsonSerializer.Serialize(message),
            Culture = context.Culture,
            ActorId = context.ActorId,
            TraceParent = context.TraceParent,
            CreatedAt = time.GetUtcNow(),
            AvailableAt = time.GetUtcNow()
        });
        if (message is EmailRequest email && email.Template is EmailTemplate.SecurityNotification or EmailTemplate.Notification)
            db.Notifications.Add(new() { UserId = email.UserId, Kind = email.Template == EmailTemplate.SecurityNotification ? "notificationSecurity" : "notificationUpdate", Link = "/profile", CreatedAt = time.GetUtcNow() });
    }
}
