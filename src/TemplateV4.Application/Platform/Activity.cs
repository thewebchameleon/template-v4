using TemplateV4.Application.Users;

namespace TemplateV4.Application.Platform;

public sealed record AuditItem(long Id, Guid? ActorId, string? ActorName, Guid? SubjectId, string? SubjectName, string Action, DateTimeOffset At);
public sealed record AuditQuery(int PageNumber = 1, int PageSize = 25, string? Action = null, Guid? ActorId = null, Guid? SubjectId = null, DateTimeOffset? From = null, DateTimeOffset? Until = null) : IQuery<Page<AuditItem>>, IAuthorizedRequest
{ public string Permission => Permissions.Settings; }
public interface IAuditHistory { Task<Page<AuditItem>> List(AuditQuery query, CancellationToken ct); }
public sealed class AuditQueryValidator : IValidator<AuditQuery>
{
    public Dictionary<string, string[]> Validate(AuditQuery query) => query.PageNumber is < 1 or > 10000 || query.PageSize is < 1 or > 100 || query.Action is { Length: > 100 } || query.From > query.Until
        ? new() { ["query"] = ["query.invalid"] } : [];
}
public sealed class AuditQueryHandler(IAuditHistory history) : IHandler<AuditQuery, Page<AuditItem>>
{
    public async Task<Result<Page<AuditItem>>> Handle(AuditQuery request, CancellationToken cancellationToken) => Result<Page<AuditItem>>.Success(await history.List(request, cancellationToken));
}
