using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed class OrganisationAttachments(FrameworkDb db, IOrganisationOperations access, ICapabilities capabilities, OrganisationFiles library) : IOrganisationAttachments
{
    public async Task<Result<Page<OrganisationAttachment>>> List(Guid actor, int page, int size, CancellationToken ct)
    {
        if (!await capabilities.Enabled(CapabilityIds.OrganisationFiles, ct)) return Result<Page<OrganisationAttachment>>.Fail("resource.not_found", ErrorKind.NotFound);
        var result = await library.List(actor, page, size, "name", "asc", ct);
        return result.IsSuccess ? Result<Page<OrganisationAttachment>>.Success(new(result.Value!.Page.Items.Select(x => new OrganisationAttachment(x.Id, x.Name, x.Size)).ToArray(), result.Value.Page.Total, page, size))
            : Result<Page<OrganisationAttachment>>.Fail(result.Error!.Code, result.Error.Kind);
    }
    public async Task<Result<OrganisationAttachment>> Upload(Guid actor, string name, Stream content, CancellationToken ct)
    {
        if (!await capabilities.Enabled(CapabilityIds.OrganisationFiles, ct)) return Result<OrganisationAttachment>.Fail("resource.not_found", ErrorKind.NotFound);
        var result = await library.Upload(actor, name, content, ct);
        return result.IsSuccess ? await Resolve(actor, result.Value, ct) : Result<OrganisationAttachment>.Fail(result.Error!.Code, result.Error.Kind);
    }
    public async Task<Result<AttachmentDownload>> Open(Guid actor, Guid fileId, CancellationToken ct)
    {
        if (!await capabilities.Enabled(CapabilityIds.OrganisationFiles, ct)) return Result<AttachmentDownload>.Fail("resource.not_found", ErrorKind.NotFound);
        var result = await library.Download(actor, fileId, ct);
        return result.IsSuccess ? Result<AttachmentDownload>.Success(new(result.Value!.Content, result.Value.Name)) : Result<AttachmentDownload>.Fail(result.Error!.Code, result.Error.Kind);
    }
    public async Task<Result<OrganisationAttachment>> Resolve(Guid actor, Guid fileId, CancellationToken ct)
    {
        if (!await capabilities.Enabled(CapabilityIds.OrganisationFiles, ct) || !await access.Allowed(actor, OrganisationOperation.Read, ct))
            return Result<OrganisationAttachment>.Fail("resource.not_found", ErrorKind.NotFound);
        var row = await db.Files.AsNoTracking().Where(x => x.Id == fileId && !x.IsFolder && x.Ready && x.DeletedAt == null && x.PurgedAt == null && !x.PurgeRequested)
            .Select(x => new OrganisationAttachment(x.Id, x.Name, x.Size)).SingleOrDefaultAsync(ct);
        return row is null ? Result<OrganisationAttachment>.Fail("resource.not_found", ErrorKind.NotFound) : Result<OrganisationAttachment>.Success(row);
    }
}
