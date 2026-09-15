namespace TemplateV4.Infrastructure.Persistence;

public sealed class IdempotencyRecord
{
    public string Key { get; set; } = "";
    public string Fingerprint { get; set; } = "";
    public Guid? ActorId { get; set; }
    public Guid? SubjectId { get; set; }
    public bool Erased { get; set; }
    public string Response { get; set; } = "";
    public DateTimeOffset ExpiresAt { get; set; }
}
