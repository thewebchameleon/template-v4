using TemplateV4.Application.Users;

namespace TemplateV4.Application.Crm;

public interface ICrmCustomers
{
    Task<Result<CrmRecord>> Resolve(Guid actor, Guid organisation, Guid id, bool allowArchived, CancellationToken ct);
    Task<Result<Page<CrmRecord>>> List(Guid actor, Guid organisation, CrmList query, CancellationToken ct);
}
public interface ICrm : ICrmCustomers
{
    Task<Result<CrmDetail>> Detail(Guid actor, Guid organisation, Guid id, CancellationToken ct);
    Task<Result<CrmRecord>> Save(Guid actor, Guid organisation, SaveCrmRecord request, CancellationToken ct);
    Task<Result<CrmRecord>> Archive(Guid actor, Guid organisation, Guid id, ArchiveCrmRecord request, CancellationToken ct);
    Task<Result<CrmNote>> Note(Guid actor, Guid organisation, Guid id, AddCrmNote request, CancellationToken ct);
    Task<Result<CrmConfiguration>> Configuration(Guid actor, Guid organisation, CancellationToken ct);
    Task<Result<CrmConfiguration>> Configure(Guid actor, Guid organisation, CrmConfiguration request, CancellationToken ct);
    Task<Result<CrmOverview>> Overview(Guid actor, Guid organisation, CancellationToken ct);
}
