
namespace TemplateV4.Infrastructure.Persistence;

public sealed class DeletionRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string State { get; set; } = "Pending";
    public DateTimeOffset RequestedAt { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public Guid? ReviewedBy { get; set; }
}
