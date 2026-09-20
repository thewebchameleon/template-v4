namespace TemplateV4.Application.Distribution;

public sealed record PrivateModuleInstalled(string Id, string Version);

public sealed record PrivateModuleRegistrationStatus(
    bool Configured,
    string? ServiceUrl,
    Guid? AppId,
    Guid? EnvironmentId,
    string Environment,
    PrivateModuleInstalled[] InstalledModules);

public sealed record RegisterPrivateModuleApp(string Name, string Environment, string Url);
public sealed record PrivateModuleRegistration(
    Guid AppId,
    Guid EnvironmentId,
    string BuildToken,
    string ServiceUrl,
    string Environment,
    string[] EnvironmentVariables);

public interface IPrivateModuleRegistration
{
    PrivateModuleRegistrationStatus Status();
    Task<PrivateModuleRegistration> Register(RegisterPrivateModuleApp request, CancellationToken ct);
}
