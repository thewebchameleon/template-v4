namespace TemplateV4.Application.Crm;

public enum OrganisationOperation { Read, Operate, Configure, Issue, Settle, Correct }
public interface IOrganisationOperations
{
    Task<bool> Allowed(Guid actor, Guid organisation, OrganisationOperation operation, CancellationToken ct);
}
