using TemplateV4.Application.Users;

namespace TemplateV4.Application.Contact;

public sealed record ContactEnquiry(Guid Id, string Name, string Email, string Message, DateTimeOffset CreatedAt, bool Read);
public sealed record ContactNotification(string ProtectedRecipient, string ProtectedAdminUrl) : IIntegrationEvent;
public interface IContact
{
    Task<Result<Page<ContactEnquiry>>> List(string search, int pageNumber, int pageSize, string sort, string direction, CancellationToken ct);
    Task<Result<Unit>> MarkRead(Guid id, CancellationToken ct);
}
