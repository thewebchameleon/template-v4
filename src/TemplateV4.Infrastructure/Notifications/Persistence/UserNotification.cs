
namespace TemplateV4.Infrastructure.Persistence;

public sealed class UserNotification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Kind { get; set; } = "";
    public string Link { get; set; } = "/profile";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ReadAt { get; set; }
}
