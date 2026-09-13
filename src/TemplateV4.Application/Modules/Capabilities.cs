namespace TemplateV4.Application.Modules;

/// <summary>Availability only. Authorization, ownership and quotas remain operation-specific.</summary>
public interface ICapabilities
{
    Task<Dictionary<string, bool>> Read(CancellationToken ct);
    Task<bool> Enabled(string capability, CancellationToken ct);
}

public sealed record ModuleActivation(string Id, bool Enabled, bool Available, Guid Version, string[] EnableBlockers, string[] DisableBlockers);
public sealed record SaveModuleActivation(string Id, bool Enabled, Guid Version) : ICommand<ModuleActivation>, IAuthorizedRequest
{ public string Permission => Users.Permissions.Settings; }
public interface IModuleActivation
{
    Task<ModuleActivation[]> Read(CancellationToken ct);
    Task<Result<ModuleActivation>> Save(SaveModuleActivation request, CancellationToken ct);
}
public sealed class SaveModuleActivationValidator(ModuleCatalog catalog) : IValidator<SaveModuleActivation>
{
    public Dictionary<string, string[]> Validate(SaveModuleActivation request)
    {
        Dictionary<string, string[]> errors = [];
        if (!catalog.RuntimeConfigurable(request.Id)) errors["id"] = ["modules.unknown"];
        if (request.Version == Guid.Empty) errors["version"] = ["validation.failed"];
        return errors;
    }
}
public sealed class SaveModuleActivationHandler(IModuleActivation modules) : IHandler<SaveModuleActivation, ModuleActivation>
{
    public Task<Result<ModuleActivation>> Handle(SaveModuleActivation request, CancellationToken cancellationToken) => modules.Save(request, cancellationToken);
}
