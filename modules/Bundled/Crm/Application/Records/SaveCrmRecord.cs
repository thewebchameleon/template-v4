namespace TemplateV4.Application.Crm;

public sealed record CrmRelationship(Guid CompanyId, string Role);
public sealed record CrmFieldValue(Guid FieldId, Guid OptionId);
public sealed record CrmRecordInput(CrmRecordKind Kind, string Name, string? Email, string? Phone,
    string? Address, Guid? LifecycleStatusId, Guid[] Tags, Guid? OwnerId, CrmRelationship[] Companies,
    CrmFieldValue[] CustomFields, Guid? CustomerId, Guid? ContactId, decimal? Value,
    DateOnly? ExpectedCloseDate, Guid? PipelineId, Guid? StageId, DealOutcome Outcome, string? VatNumber = null);
public sealed record SaveCrmRecord(Guid? Id, Guid? Version, CrmRecordInput Data);
