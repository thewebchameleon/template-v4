namespace TemplateV4.Infrastructure.Persistence;

public sealed class OutboxMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Type { get; set; } = "";
    public string Payload { get; set; } = "";
    public string Culture { get; set; } = "en-ZA";
    public string? TraceParent { get; set; }
    public Guid? ActorId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset AvailableAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public DateTimeOffset? PoisonedAt { get; set; }
    public int Attempts { get; set; }
    public string? LastErrorCode { get; set; }
    public Guid? LeaseId { get; set; }
    public DateTimeOffset? LeaseUntil { get; set; }
}
public sealed class InboxReceipt
{
    public Guid Id { get; set; }
    public DateTimeOffset CompletedAt { get; set; }
}
