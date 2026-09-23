using TemplateV4.Application.Users;

namespace TemplateV4.Application.Crm;

public interface ICrmCustomers
{
    Task<Result<CrmRecord>> Resolve(Guid actor, Guid id, bool allowArchived, CancellationToken ct);
    Task<Result<Page<CrmRecord>>> List(Guid actor, CrmList query, CancellationToken ct);
}
public interface ICrm : ICrmCustomers
{
    Task<Result<CrmDetail>> Detail(Guid actor, Guid id, CancellationToken ct);
    Task<Result<CrmRecord>> Save(Guid actor, SaveCrmRecord request, CancellationToken ct);
    Task<Result<CrmRecord>> Archive(Guid actor, Guid id, ArchiveCrmRecord request, CancellationToken ct);
    Task<Result<CrmNote>> Note(Guid actor, Guid id, AddCrmNote request, CancellationToken ct);
    Task<Result<CrmConfiguration>> Configuration(Guid actor, CancellationToken ct);
    Task<Result<CrmConfiguration>> Configure(Guid actor, CrmConfiguration request, CancellationToken ct);
    Task<Result<CrmOverview>> Overview(Guid actor, CancellationToken ct);
}
