namespace TemplateV4.Infrastructure.Persistence;

public sealed class ActionItemRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Source { get; set; } = "Manual";
    public Guid? SourceId { get; set; }
    public Guid? SubjectId { get; set; }
    public Guid? CreatorId { get; set; }
    public Guid? AssigneeId { get; set; }
    public string? QueueId { get; set; }
    public string Link { get; set; } = "";
    public string State { get; set; } = "Open";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public Guid? CompletedBy { get; set; }
}
