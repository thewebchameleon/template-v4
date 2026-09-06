namespace TemplateV4.Domain.Users;

public interface IDomainEvent { }
public interface IDomainEventSource { IReadOnlyList<IDomainEvent> Events { get; } void ClearEvents(); }
public sealed record UserProvisioned(Guid UserId, string Culture) : IDomainEvent;

public sealed class UserProfile : IDomainEventSource
{
    private readonly List<IDomainEvent> _events = [];
    private UserProfile() { }
    public Guid Id { get; private set; }
    public string DisplayName { get; private set; } = "";
    public string Culture { get; private set; } = "en-ZA";
    public bool Disabled { get; private set; }
    public DateTimeOffset? DeletedAt { get; private set; }
    public Guid Version { get; private set; } = Guid.NewGuid();
    public IReadOnlyList<IDomainEvent> Events => _events;

    public static UserProfile Create(Guid id, string displayName, string culture, bool invitationRequired = true)
    {
        if (id == Guid.Empty || string.IsNullOrWhiteSpace(displayName) || displayName.Trim().Length > 120)
            throw new ArgumentException("A user requires an identifier and a display name of at most 120 characters.");
        var user = new UserProfile { Id = id, DisplayName = displayName.Trim(), Culture = culture };
        if (invitationRequired) user._events.Add(new UserProvisioned(id, culture));
        return user;
    }

    public void SetDisabled(bool disabled) { Disabled = disabled; Version = Guid.NewGuid(); }
    public void SetCulture(string culture) { Culture = culture; Version = Guid.NewGuid(); }
    public void SoftDelete(DateTimeOffset now) { DeletedAt = now; SetDisabled(true); }
    public void Anonymise(DateTimeOffset now) { DisplayName = "Deleted account"; Culture = "en-ZA"; SoftDelete(now); }
    public void ClearEvents() => _events.Clear();
}
