namespace TemplateV4.Application;

public interface IDomainEventHandler
{
    bool Handles(TemplateV4.Domain.Users.IDomainEvent domainEvent);
    void Handle(TemplateV4.Domain.Users.IDomainEvent domainEvent);
}
public sealed class UserProvisionedHandler(IEventOutbox outbox) : IDomainEventHandler
{
    public bool Handles(TemplateV4.Domain.Users.IDomainEvent domainEvent) => domainEvent is TemplateV4.Domain.Users.UserProvisioned;
    public void Handle(TemplateV4.Domain.Users.IDomainEvent domainEvent)
    {
        var created = (TemplateV4.Domain.Users.UserProvisioned)domainEvent;
        outbox.Add(new UserCreated(created.UserId, created.Culture));
    }
}
public sealed record UserCreated(Guid UserId, string Culture) : IIntegrationEvent;
public sealed record JobRequested(Guid RequestId, string Culture) : IIntegrationEvent;

public enum EmailTemplate { Verification, PasswordReset, SecurityNotification, Notification, MfaCode, SupportTicket, OrganizationInvitation }
public sealed record EmailRequest(Guid UserId, EmailTemplate Template, string Culture, string? ActionUrl = null, string? TemplateName = null, string? ProtectedContent = null, string? ProtectedRecipient = null) : IIntegrationEvent;
public interface IEmailSender { Task Send(string recipient, EmailRequest email, Guid messageId, CancellationToken cancellationToken); }
