using TemplateV4.Application.Users;

namespace TemplateV4.Application.Platform;

public sealed record AuditItem(long Id, Guid? ActorId, string? ActorName, Guid? SubjectId, string? SubjectName, string Action, DateTimeOffset At);
public sealed record AuditChange(string Field, string? Before, string? After);
public sealed record AuditRelatedEntity(string Type, Guid Id, string? Name);
public sealed record AuditDetail(AuditItem Entry, string? ActorType, string? SubjectType, string? Outcome, string? FailureCode,
    string? Source, string? Reason, string? TraceParent, int? SchemaVersion, AuditChange[] Changes,
    AuditRelatedEntity[] RelatedEntities, Dictionary<string, string> Metadata);
public sealed record GetAuditDetail(long Id) : IQuery<AuditDetail>, IAuthorizedRequest
{ public string Permission => Permissions.Settings; }
public sealed record AuditQuery(int PageNumber = 1, int PageSize = 25, string? Action = null, Guid? ActorId = null, Guid? SubjectId = null, DateTimeOffset? From = null, DateTimeOffset? Until = null, string Sort = "at", string Direction = "desc") : IQuery<Page<AuditItem>>, IAuthorizedRequest
{ public string Permission => Permissions.Settings; }
public interface IAuditHistory
{
    Task<Page<AuditItem>> List(AuditQuery query, CancellationToken ct);
    Task<AuditDetail?> Detail(long id, CancellationToken ct);
}
public sealed class AuditDetailHandler(IAuditHistory history) : IHandler<GetAuditDetail, AuditDetail>
{
    public async Task<Result<AuditDetail>> Handle(GetAuditDetail request, CancellationToken cancellationToken) =>
        await history.Detail(request.Id, cancellationToken) is { } detail
            ? Result<AuditDetail>.Success(detail) : Result<AuditDetail>.Fail("audit.not_found", ErrorKind.NotFound);
}
public sealed class AuditQueryValidator : IValidator<AuditQuery>
{
    public Dictionary<string, string[]> Validate(AuditQuery query) => query.PageNumber is < 1 or > 10000 || query.PageSize is < 1 or > 100 || query.Action is { Length: > 100 } || query.From > query.Until || query.Sort is not ("at" or "action" or "actorName" or "subjectName") || query.Direction is not ("asc" or "desc")
        ? new() { ["query"] = ["query.invalid"] } : [];
}
public sealed class AuditQueryHandler(IAuditHistory history) : IHandler<AuditQuery, Page<AuditItem>>
{
    public async Task<Result<Page<AuditItem>>> Handle(AuditQuery request, CancellationToken cancellationToken) => Result<Page<AuditItem>>.Success(await history.List(request, cancellationToken));
}
