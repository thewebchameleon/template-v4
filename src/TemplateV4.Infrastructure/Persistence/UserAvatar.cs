namespace TemplateV4.Infrastructure.Persistence;

public sealed class UserAvatar
{
    public Guid UserId { get; set; }
    public byte[] Png { get; set; } = [];
}
