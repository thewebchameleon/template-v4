namespace TemplateV4.Infrastructure.Persistence;

public sealed class BackgroundJobSchedule
{
    public string Id { get; set; } = string.Empty;
    public bool Paused { get; set; }
    public DateTimeOffset? NextRunAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
    public Guid Version { get; set; }
}
