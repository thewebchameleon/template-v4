using TemplateV4.Application.Users;

namespace TemplateV4.Application.Platform;

public sealed record AuditChange(string Field, string? Before, string? After);
public sealed record AuditRelatedEntity(string Type, Guid Id, string? Name);
public sealed record AuditDetail(AuditItem Entry, string? ActorType, string? SubjectType, string? Outcome, string? FailureCode,
    string? Source, string? Reason, string? TraceParent, int? SchemaVersion, AuditChange[] Changes,
    AuditRelatedEntity[] RelatedEntities, Dictionary<string, string> Metadata);
public sealed record GetAuditDetail(long Id) : IQuery<AuditDetail>, IAuthorizedRequest
{ public string Permission => Permissions.Settings; }
public sealed class AuditDetailHandler(IAuditHistory history) : IHandler<GetAuditDetail, AuditDetail>
{
    public async Task<Result<AuditDetail>> Handle(GetAuditDetail request, CancellationToken cancellationToken) =>
        await history.Detail(request.Id, cancellationToken) is { } detail
            ? Result<AuditDetail>.Success(detail) : Result<AuditDetail>.Fail("audit.not_found", ErrorKind.NotFound);
}
