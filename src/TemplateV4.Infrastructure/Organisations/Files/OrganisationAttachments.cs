using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed class OrganisationAttachments(FrameworkDb db, IOrganisationOperations access, ICapabilities capabilities, OrganisationFiles library) : IOrganisationAttachments
{
    public async Task<Result<Page<OrganisationAttachment>>> List(Guid actor, Guid organisation, int page, int size, CancellationToken ct)
    {
        if (!await capabilities.Enabled(CapabilityIds.OrganisationFiles, ct)) return Result<Page<OrganisationAttachment>>.Fail("resource.not_found", ErrorKind.NotFound);
        var result = await library.List(actor, organisation, page, size, "name", "asc", ct);
        return result.IsSuccess ? Result<Page<OrganisationAttachment>>.Success(new(result.Value!.Page.Items.Select(x => new OrganisationAttachment(x.Id, x.Name, x.Size)).ToArray(), result.Value.Page.Total, page, size))
            : Result<Page<OrganisationAttachment>>.Fail(result.Error!.Code, result.Error.Kind);
    }
    public async Task<Result<OrganisationAttachment>> Upload(Guid actor, Guid organisation, string name, Stream content, CancellationToken ct)
    {
        if (!await capabilities.Enabled(CapabilityIds.OrganisationFiles, ct)) return Result<OrganisationAttachment>.Fail("resource.not_found", ErrorKind.NotFound);
        var result = await library.Upload(actor, organisation, name, content, ct);
        return result.IsSuccess ? await Resolve(actor, organisation, result.Value, ct) : Result<OrganisationAttachment>.Fail(result.Error!.Code, result.Error.Kind);
    }
    public async Task<Result<AttachmentDownload>> Open(Guid actor, Guid organisation, Guid fileId, CancellationToken ct)
    {
        if (!await capabilities.Enabled(CapabilityIds.OrganisationFiles, ct)) return Result<AttachmentDownload>.Fail("resource.not_found", ErrorKind.NotFound);
        var result = await library.Download(actor, organisation, fileId, ct);
        return result.IsSuccess ? Result<AttachmentDownload>.Success(new(result.Value!.Content, result.Value.Name)) : Result<AttachmentDownload>.Fail(result.Error!.Code, result.Error.Kind);
    }
    public async Task<Result<OrganisationAttachment>> Resolve(Guid actor, Guid organisation, Guid fileId, CancellationToken ct)
    {
        if (!await capabilities.Enabled(CapabilityIds.OrganisationFiles, ct) || !await access.Allowed(actor, organisation, OrganisationOperation.Read, ct))
            return Result<OrganisationAttachment>.Fail("resource.not_found", ErrorKind.NotFound);
        var row = await db.Set<OrganisationFileRow>().AsNoTracking().Where(x => x.CustomerId == organisation && x.Id == fileId && x.Ready && x.DeletedAt == null)
            .Select(x => new OrganisationAttachment(x.Id, x.Name, x.Size)).SingleOrDefaultAsync(ct);
        return row is null ? Result<OrganisationAttachment>.Fail("resource.not_found", ErrorKind.NotFound) : Result<OrganisationAttachment>.Success(row);
    }
}
