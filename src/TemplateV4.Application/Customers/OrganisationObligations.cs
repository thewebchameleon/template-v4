namespace TemplateV4.Application.Customers;

// Evaluated under the membership mutation and organisation locks by the closing operation.
public interface IOrganisationObligations
{
    Task<bool> PreventsClosure(Guid organisation, CancellationToken ct);
}
