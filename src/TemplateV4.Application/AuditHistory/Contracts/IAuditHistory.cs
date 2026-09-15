using TemplateV4.Application.Users;

namespace TemplateV4.Application.Platform;

public interface IAuditHistory
{
    Task<Page<AuditItem>> List(AuditQuery query, CancellationToken ct);
    Task<AuditDetail?> Detail(long id, CancellationToken ct);
}
