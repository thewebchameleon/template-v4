namespace TemplateV4.Infrastructure.Persistence;

public sealed class AuditEntry
{
    public long Id { get; set; }
    public Guid? SessionId { get; set; }
    public Guid? ActorId { get; set; }
    public Guid? SubjectId { get; set; }
    public string Action { get; set; } = "";
    public string? TraceParent { get; set; }
    public DateTimeOffset At { get; set; }
    public int? SchemaVersion { get; set; }
    public string? ActorType { get; set; }
    public string? ActorNameSnapshot { get; set; }
    public string? SubjectType { get; set; }
    public string? SubjectNameSnapshot { get; set; }
    public string? Outcome { get; set; }
    public string? FailureCode { get; set; }
    public string? Source { get; set; }
    public string? Reason { get; set; }
    public string? ChangesJson { get; set; }
    public string? RelatedEntitiesJson { get; set; }
    public string? MetadataJson { get; set; }
}
