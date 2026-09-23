using TemplateV4.Application;
using System.Text.Json;
using TemplateV4.Application.Contact;

namespace TemplateV4.Infrastructure.Support;

public sealed class ContactNotificationConsumer(IEmailSender email) : IIntegrationConsumer
{
    public string Contract => "contact.notification.v1";
    public Task Handle(MessageEnvelope message, CancellationToken cancellationToken)
    {
        var contact = JsonSerializer.Deserialize<ContactNotification>(message.Payload)!;
        return email.Send("unused@example.invalid", new EmailRequest(Guid.Empty, EmailTemplate.ContactEnquiry, message.Culture,
            ActionUrl: contact.ProtectedAdminUrl, ProtectedRecipient: contact.ProtectedRecipient), message.Id, cancellationToken);
    }
}
