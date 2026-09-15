
namespace TemplateV4.Application.Modules;

/// <summary>Availability only. Authorization, ownership and quotas remain operation-specific.</summary>
public interface ICapabilities
{
    Task<Dictionary<string, bool>> Read(CancellationToken ct);
    Task<bool> Enabled(string capability, CancellationToken ct);
}
