using TemplateV4.Application.Contact;

namespace TemplateV4.Infrastructure.Support;

public sealed class SupportIntegrationContracts : IIntegrationContractContributor
{
    public void Register(IntegrationContracts contracts) => contracts.Register<ContactNotification>("contact.notification.v1");
}
