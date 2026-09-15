
namespace TemplateV4.Application;

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
