namespace TemplateV4.Infrastructure.Updates;

public sealed class UpdateState
{
    public int Id { get; set; } = 1;
    public DateTimeOffset? CheckedAt { get; set; }
    public DateTimeOffset? SucceededAt { get; set; }
    public string Status { get; set; } = "pending";
    public string InstalledHash { get; set; } = "";
    public string ReleasesJson { get; set; } = "[]";
}
public sealed class UpdateAnnouncement
{
    public string Component { get; set; } = "";
    public string Version { get; set; } = "";
}
