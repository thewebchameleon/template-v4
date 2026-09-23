namespace TemplateV4.Application.Crm;

public enum CrmRecordKind { Contact, Company, Deal }
public enum DealOutcome { Open, Won, Lost }
public sealed record CrmRecord(Guid Id, Guid Version, CrmRecordInput Data,
    bool Archived, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt);
public sealed record CrmList(CrmRecordKind Kind, string Search = "", bool Archived = false,
    int PageNumber = 1, int PageSize = 10, string Sort = "name", string Direction = "asc");
