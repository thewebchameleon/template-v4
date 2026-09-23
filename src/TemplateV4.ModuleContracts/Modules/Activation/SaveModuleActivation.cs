
namespace TemplateV4.Application.Modules;

public sealed record SaveModuleActivation(string Id, bool Enabled, Guid Version) : ICommand<ModuleActivation>, IAuthorizedRequest
{ public string Permission => Users.Permissions.Settings; }
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
