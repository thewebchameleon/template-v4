
namespace TemplateV4.Application.Modules;

public sealed record ModuleActivation(string Id, bool Enabled, bool Available, Guid Version, string[] EnableBlockers, string[] DisableBlockers, bool Initialized = true);
public interface IModuleActivation
{
    Task<ModuleActivation[]> Read(CancellationToken ct);
    Task<Result<ModuleActivation>> Save(SaveModuleActivation request, CancellationToken ct);
}
