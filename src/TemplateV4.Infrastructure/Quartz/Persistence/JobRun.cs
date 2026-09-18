namespace TemplateV4.Infrastructure.Persistence;

public sealed class JobRun
{
    public Guid Id { get; set; }
    public string DefinitionId { get; set; } = "maintenance";
    public string State { get; set; } = "Pending";
    public string Culture { get; set; } = "en-ZA";
    public Guid? ActorId { get; set; }
    public string? TraceParent { get; set; }
    public int Attempts { get; set; }
    public DateTimeOffset AvailableAt { get; set; }
    public DateTimeOffset? LeaseUntil { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string? ErrorCode { get; set; }
}
