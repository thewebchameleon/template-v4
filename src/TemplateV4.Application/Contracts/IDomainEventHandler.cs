
namespace TemplateV4.Application;

public interface IDomainEventHandler
{
    bool Handles(TemplateV4.Domain.Users.IDomainEvent domainEvent);
    void Handle(TemplateV4.Domain.Users.IDomainEvent domainEvent);
}
