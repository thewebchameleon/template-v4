namespace TemplateV4.Application.Modules;

/// <summary>Module-owned persisted restrictions, applied before capability dependencies are evaluated.</summary>
public interface ICapabilityRestrictions
{
    Task<IReadOnlyDictionary<string, bool>> Read(CancellationToken ct);
}
