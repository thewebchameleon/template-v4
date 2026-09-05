namespace templatev4.Application;

public interface IDomainEventHandler
{
    bool Handles(templatev4.Domain.Users.IDomainEvent domainEvent);
    void Handle(templatev4.Domain.Users.IDomainEvent domainEvent);
}
public sealed class UserProvisionedHandler(IEventOutbox outbox) : IDomainEventHandler
{
    public bool Handles(templatev4.Domain.Users.IDomainEvent domainEvent) => domainEvent is templatev4.Domain.Users.UserProvisioned;
    public void Handle(templatev4.Domain.Users.IDomainEvent domainEvent)
    {
        var created = (templatev4.Domain.Users.UserProvisioned)domainEvent;
        outbox.Add(new UserCreated(created.UserId, created.Culture));
    }
}
public sealed record UserCreated(Guid UserId, string Culture) : IIntegrationEvent;
public sealed record JobRequested(Guid RequestId, string Culture) : IIntegrationEvent;

public enum EmailTemplate { Verification, PasswordReset, SecurityNotification, Notification }
public sealed record EmailRequest(Guid UserId, EmailTemplate Template, string Culture, string? ActionUrl = null, string? TemplateName = null) : IIntegrationEvent;
public interface IEmailSender { Task Send(string recipient, EmailRequest email, Guid messageId, CancellationToken cancellationToken); }
