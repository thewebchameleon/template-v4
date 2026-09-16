namespace TemplateV4.Infrastructure;

public sealed class BackgroundExecutionContext : IExecutionContext
{
    public Guid? ActorId { get; set; }
    public IReadOnlySet<string> Permissions { get; set; } = new HashSet<string>();
    public string Culture { get; set; } = "en-ZA";
    public string? TraceParent { get; set; }
}
