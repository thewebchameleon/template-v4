using TemplateV4.Application.Users;

namespace TemplateV4.Application.Crm;

public enum CrmRecordKind { Contact, Company, Deal }
public enum DealOutcome { Open, Won, Lost }
public enum OrganisationOperation { Read, Operate, Configure, Issue, Settle, Correct }
public sealed record CrmRelationship(Guid CompanyId, string Role);
public sealed record CrmFieldValue(Guid FieldId, Guid OptionId);
public sealed record CrmOption(Guid Id, string Label, bool Retired = false);
public sealed record CrmField(Guid Id, string Label, CrmOption[] Options, bool Retired = false);
public sealed record CrmStage(Guid Id, string Label, bool Retired = false);
public sealed record CrmPipeline(Guid Id, string Label, CrmStage[] Stages, bool Retired = false);
public sealed record CrmConfiguration(Guid Version, CrmOption[] LifecycleStatuses, CrmOption[] Tags,
    CrmPipeline[] Pipelines, CrmField[] ContactFields);
public sealed record CrmRecordInput(CrmRecordKind Kind, string Name, string? Email, string? Phone,
    string? Address, Guid? LifecycleStatusId, Guid[] Tags, Guid? OwnerId, CrmRelationship[] Companies,
    CrmFieldValue[] CustomFields, Guid? CustomerId, Guid? ContactId, decimal? Value,
    DateOnly? ExpectedCloseDate, Guid? PipelineId, Guid? StageId, DealOutcome Outcome, string? VatNumber = null);
public sealed record CrmRecord(Guid Id, Guid OrganisationId, Guid Version, CrmRecordInput Data,
    bool Archived, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt);
public sealed record CrmNote(Guid Id, Guid RecordId, Guid ActorId, string Text, DateTimeOffset At);
public sealed record CrmDetail(CrmRecord Record, CrmNote[] Notes);
public sealed record CrmOverview(int OpenDeals, decimal OpenValue, CrmRecord[] Recent);
public sealed record CrmList(CrmRecordKind Kind, string Search = "", bool Archived = false,
    int PageNumber = 1, int PageSize = 10, string Sort = "name", string Direction = "asc");
public sealed record SaveCrmRecord(Guid? Id, Guid? Version, CrmRecordInput Data);
public sealed record ArchiveCrmRecord(Guid Version, bool Archived);
public sealed record AddCrmNote(string Text);
public interface IOrganisationOperations
{
    Task<bool> Allowed(Guid actor, Guid organisation, OrganisationOperation operation, CancellationToken ct);
}
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
