using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Invoicing;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Crm;

public sealed class CrmAttachmentRow
{
    public Guid RecordId { get; set; }
    public Guid FileId { get; set; }
}
public sealed class InvoiceAttachmentRow
{
    public Guid RecordId { get; set; }
    public Guid FileId { get; set; }
}
public static class RecordAttachmentMappings
{
    public static void Configure(ModelBuilder model)
    {
        var crm = model.Entity<CrmAttachmentRow>(); crm.ToTable("attachments", "crm"); crm.HasKey(x => new { x.RecordId, x.FileId });
        var invoices = model.Entity<InvoiceAttachmentRow>(); invoices.ToTable("attachments", "invoicing"); invoices.HasKey(x => new { x.RecordId, x.FileId });
    }
}
public sealed class RecordAttachments(FrameworkDb db, IOrganisationOperations access, ICrm crm,
    ICommercialDocuments invoices, IOrganisationAttachments files, ICapabilities capabilities, TimeProvider time) : IRecordAttachments
{
    private async Task<bool> Authorized(Guid actor, AttachmentRecordKind kind, Guid record, bool write, CancellationToken ct)
    {
        if (!Enum.IsDefined(kind) || !await capabilities.Enabled(kind == AttachmentRecordKind.Crm ? CapabilityIds.CrmFiles : CapabilityIds.InvoicingFiles, ct) ||
            !await access.Allowed(actor, write ? (kind == AttachmentRecordKind.Crm ? OrganisationOperation.Operate : OrganisationOperation.Issue) : OrganisationOperation.Read, ct)) return false;
        return kind == AttachmentRecordKind.Crm ? (await crm.Detail(actor, record, ct)).IsSuccess : (await invoices.Read(actor, record, ct)).IsSuccess;
    }
    public async Task<Result<RecordAttachment[]>> List(Guid actor, AttachmentRecordKind kind, Guid record, CancellationToken ct)
    {
        if (!await Authorized(actor, kind, record, false, ct)) return Result<RecordAttachment[]>.Fail("resource.not_found", ErrorKind.NotFound);
        var ids = kind == AttachmentRecordKind.Crm
            ? await db.Set<CrmAttachmentRow>().Where(x => x.RecordId == record).OrderBy(x => x.FileId).Select(x => x.FileId).ToArrayAsync(ct)
            : await db.Set<InvoiceAttachmentRow>().Where(x => x.RecordId == record).OrderBy(x => x.FileId).Select(x => x.FileId).ToArrayAsync(ct);
        var result = new List<RecordAttachment>();
        foreach (var id in ids) { var file = await files.Resolve(actor, id, ct); result.Add(new(id, file.Value?.Name, file.Value?.Size, file.IsSuccess)); }
        return Result<RecordAttachment[]>.Success(result.ToArray());
    }
    public async Task<Result<Unit>> Change(Guid actor, AttachmentRecordKind kind, Guid record, ChangeRecordAttachment change, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await CustomerAccess.MutationLock(db, ct);
        if (!await Authorized(actor, kind, record, true, ct)) return Result.Fail("resource.not_found", ErrorKind.NotFound);
        if (change.Attached && !(await files.Resolve(actor, change.FileId, ct)).IsSuccess) return Result.Fail("resource.not_found", ErrorKind.NotFound);
        if (kind == AttachmentRecordKind.Crm)
        {
            var row = await db.Set<CrmAttachmentRow>().FindAsync([record, change.FileId], ct);
            if (change.Attached && row == null) db.Add(new CrmAttachmentRow { RecordId = record, FileId = change.FileId });
            else if (!change.Attached && row != null) db.Remove(row);
        }
        else
        {
            var row = await db.Set<InvoiceAttachmentRow>().FindAsync([record, change.FileId], ct);
            if (change.Attached && row == null) db.Add(new InvoiceAttachmentRow { RecordId = record, FileId = change.FileId });
            else if (!change.Attached && row != null) db.Remove(row);
        }
        db.Audit.Add(new() { ActorId = actor, SubjectId = record, SubjectType = kind == AttachmentRecordKind.Crm ? "crm.record" : "invoicing.document", Action = change.Attached ? "attachment.linked" : "attachment.unlinked", At = time.GetUtcNow(), RelatedEntitiesJson = JsonSerializer.Serialize(new[] { new { Type = "organisation", Id = Organisation.Id } }) });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
