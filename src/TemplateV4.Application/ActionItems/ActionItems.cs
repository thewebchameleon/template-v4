using TemplateV4.Application.Users;

namespace TemplateV4.Application.Platform;

public sealed record ActionItemDto(Guid Id, string Title, string Description, string Source, string Link, Guid? AssigneeId, string? QueueId, string Assignee, string State, DateTimeOffset CreatedAt, DateTimeOffset? CompletedAt, bool CanComplete);
public sealed record ActionItemsQuery(int PageNumber = 1, int PageSize = 10, string Scope = "mine", string State = "Open", string Sort = "createdAt", string Direction = "desc", string? Search = null);
public sealed record CreateActionItem(string Title, string Description, string Link, Guid? AssigneeId = null, string? QueueId = null);
public sealed record ActionQueue(string Id, string Label);
public static class ActionQueues
{
    public const string RegistrationApprovals = "registration-approvals";
    public const string PrivacyReviews = "privacy-reviews";
    public static IReadOnlyList<ActionQueue> All { get; } = Array.AsReadOnly<ActionQueue>([
        new(RegistrationApprovals, "actionQueueRegistration"), new(PrivacyReviews, "actionQueuePrivacy")]);
    public static string ForSource(string source) => source switch
    {
        "Registration" => RegistrationApprovals,
        "Privacy" => PrivacyReviews,
        _ => throw new ArgumentOutOfRangeException(nameof(source))
    };
}
public sealed record ActionAssignee(Guid Id, string Name);
public interface IActionItems
{
    Task<Result<Page<ActionItemDto>>> List(Guid actor, ActionItemsQuery query, CancellationToken ct);
    Task<Result<Guid>> Create(Guid actor, CreateActionItem request, CancellationToken ct);
    Task<Result<Unit>> Complete(Guid actor, Guid id, CancellationToken ct);
    Task<ActionAssignee[]> Assignees(string search, CancellationToken ct);
    Task AddReview(string source, Guid sourceId, Guid subjectId, string title, string link, CancellationToken ct);
    Task ResolveReview(string source, Guid sourceId, Guid actor, CancellationToken ct);
    Task AddAssignedReview(string source, Guid sourceId, Guid assigneeId, string title, string link, CancellationToken ct);
}

public interface ISystemActionEligibility
{
    string Source { get; }
    Task<Guid[]> EligibleSources(Guid actor, CancellationToken ct);
}
