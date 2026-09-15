using TemplateV4.Application.Users;

namespace TemplateV4.Application.Crm;

public sealed record OrganisationAttachment(Guid Id, string Name, long Size);
public sealed record AttachmentDownload(Stream Content, string Name);
public interface IOrganisationAttachments
{
    Task<Result<OrganisationAttachment>> Resolve(Guid actor, Guid organisation, Guid fileId, CancellationToken ct);
    Task<Result<Page<OrganisationAttachment>>> List(Guid actor, Guid organisation, int page, int size, CancellationToken ct);
    Task<Result<OrganisationAttachment>> Upload(Guid actor, Guid organisation, string name, Stream content, CancellationToken ct);
    Task<Result<AttachmentDownload>> Open(Guid actor, Guid organisation, Guid fileId, CancellationToken ct);
}
