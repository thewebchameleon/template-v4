namespace TemplateV4.Infrastructure.Persistence;

public sealed class CustomerRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? PersonalUserId { get; set; }
    public DateTimeOffset? ClosedAt { get; set; }
    public string Name { get; set; } = "";
    public Guid Version { get; set; } = Guid.NewGuid();
}
public sealed class MembershipRow
{
    public Guid CustomerId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = "Member";
}
public sealed class CustomerInviteRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public string Email { get; set; } = "";
    public string Role { get; set; } = "Member";
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? SentAt { get; set; }
}
