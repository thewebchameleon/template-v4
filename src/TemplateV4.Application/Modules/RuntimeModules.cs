using TemplateV4.Application.Users;

namespace TemplateV4.Application.Modules;

public sealed record RuntimeModule(string Id, bool Enabled, bool Available, Guid Version);
public sealed record SaveRuntimeModule(string Id, bool Enabled, Guid Version) : ICommand<RuntimeModule>, IAuthorizedRequest
{ public string Permission => Permissions.Settings; }

public interface IRuntimeModules
{
    Task<RuntimeModule[]> Read(CancellationToken ct);
    Task<bool> Enabled(string id, CancellationToken ct);
    Task<Result<RuntimeModule>> Save(SaveRuntimeModule request, CancellationToken ct);
}

public sealed class SaveRuntimeModuleValidator : IValidator<SaveRuntimeModule>
{
    public Dictionary<string, string[]> Validate(SaveRuntimeModule request)
    {
        Dictionary<string, string[]> errors = [];
        if (request.Id != "files") errors["id"] = ["modules.unknown"];
        if (request.Version == Guid.Empty) errors["version"] = ["validation.failed"];
        return errors;
    }
}

public sealed class SaveRuntimeModuleHandler(IRuntimeModules modules) : IHandler<SaveRuntimeModule, RuntimeModule>
{
    public Task<Result<RuntimeModule>> Handle(SaveRuntimeModule request, CancellationToken cancellationToken) => modules.Save(request, cancellationToken);
}
