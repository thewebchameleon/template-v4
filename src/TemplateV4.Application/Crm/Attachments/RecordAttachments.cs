namespace TemplateV4.Application.Crm;

public enum AttachmentRecordKind { Crm, Invoicing }
public sealed record RecordAttachment(Guid FileId, string? Name, long? Size, bool Available);
public sealed record ChangeRecordAttachment(Guid FileId, bool Attached);
public interface IRecordAttachments
{
    Task<Result<RecordAttachment[]>> List(Guid actor, AttachmentRecordKind kind, Guid record, CancellationToken ct);
    Task<Result<Unit>> Change(Guid actor, AttachmentRecordKind kind, Guid record, ChangeRecordAttachment change, CancellationToken ct);
}
