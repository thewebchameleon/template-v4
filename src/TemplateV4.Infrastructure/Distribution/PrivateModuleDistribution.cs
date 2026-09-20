using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Distribution;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Updates;

namespace TemplateV4.Infrastructure.Distribution;

public sealed class PrivateModuleDistributionConfiguration
{
    public string? Url { get; }
    public Guid? AppId { get; }
    public string? AppToken { get; }
    public Guid? EnvironmentId { get; }
    public string? BuildToken { get; }
    public string Environment { get; }

    public PrivateModuleDistributionConfiguration(IConfiguration configuration)
    {
        Url = System.Environment.GetEnvironmentVariable("MODULE_DISTRIBUTION_URL") ?? configuration["ModuleDistribution:Url"];
        AppId = ReadGuid("MODULE_APP_ID", configuration["ModuleDistribution:AppId"]);
        AppToken = System.Environment.GetEnvironmentVariable("MODULE_APP_TOKEN") ?? configuration["ModuleDistribution:AppToken"];
        EnvironmentId = ReadGuid("MODULE_ENVIRONMENT_ID", configuration["ModuleDistribution:EnvironmentId"]);
        BuildToken = System.Environment.GetEnvironmentVariable("MODULE_BUILD_TOKEN") ?? configuration["ModuleDistribution:BuildToken"];
        Environment = System.Environment.GetEnvironmentVariable("MODULE_ENVIRONMENT") ?? configuration["ModuleDistribution:Environment"] ?? "production";
        if (Url is not null && !Origin(Url)) throw new InvalidOperationException("Module distribution URL must be an HTTPS origin.");
        if (Environment is not ("production" or "staging" or "development")) throw new InvalidOperationException("Unknown module environment.");
        if (EnvironmentId is not null && AppId is null)
            throw new InvalidOperationException("A module distribution environment ID requires its app ID.");
        if ((AppId is null) != string.IsNullOrWhiteSpace(AppToken) && EnvironmentId is null)
            throw new InvalidOperationException("Module distribution app ID and app credential must be configured together before adding an environment.");
    }

    private static Guid? ReadGuid(string environmentName, string? configured)
    {
        var value = System.Environment.GetEnvironmentVariable(environmentName) ?? configured;
        return string.IsNullOrWhiteSpace(value) ? null : Guid.Parse(value);
    }

    private static bool Origin(string? value) => Uri.TryCreate(value, UriKind.Absolute, out var uri) && ReleaseVersions.Https(value) &&
        uri.AbsolutePath == "/" && uri.Query.Length == 0;

    public bool HasOrigin => Origin(Url);
}

internal sealed record CentralRegistration(Guid AppId, Guid EnvironmentId, string BuildToken, string? AppToken);

public sealed class PrivateModuleRegistrationClient(
    HttpClient http,
    PrivateModuleDistributionConfiguration configuration,
    UpdateConfiguration updates) : IPrivateModuleRegistration
{
    public PrivateModuleRegistrationStatus Status() => new(
        configuration.AppId is not null && configuration.EnvironmentId is not null,
        configuration.Url,
        configuration.AppId,
        configuration.EnvironmentId,
        configuration.Environment,
        updates.Installed.Components.Where(x => x.Id != "foundation").OrderBy(x => x.Id)
            .Select(x => new PrivateModuleInstalled(x.Id, x.Version)).ToArray());

    public async Task<PrivateModuleRegistration> Register(RegisterPrivateModuleApp request, CancellationToken ct)
    {
        if (!configuration.HasOrigin) throw new InvalidOperationException("Configure ModuleDistribution:Url before registration.");
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 160 || request.Environment is not ("production" or "staging" or "development") ||
            !ReleaseVersions.Https(request.Url) || request.Url.Length > 1500) throw new ArgumentException("Invalid private module registration.");
        using var message = new HttpRequestMessage(HttpMethod.Post, configuration.Url!.TrimEnd('/') + "/api/v1/client-management/register")
        {
            Content = JsonContent.Create(new
            {
                request.Name,
                request.Environment,
                request.Url,
                configuration.AppId,
                configuration.AppToken
            })
        };
        using var response = await http.SendAsync(message, HttpCompletionOption.ResponseHeadersRead, ct);
        response.EnsureSuccessStatusCode();
        await response.Content.LoadIntoBufferAsync(64 * 1024, ct);
        var registered = await response.Content.ReadFromJsonAsync<CentralRegistration>(ct) ?? throw new InvalidDataException("Empty registration response.");
        var values = new[]
        {
            $"MODULE_DISTRIBUTION_URL={configuration.Url!.TrimEnd('/')}",
            $"MODULE_APP_ID={registered.AppId}",
            $"MODULE_APP_TOKEN={registered.AppToken ?? configuration.AppToken}",
            $"MODULE_ENVIRONMENT_ID={registered.EnvironmentId}",
            $"MODULE_ENVIRONMENT={request.Environment}",
            $"MODULE_BUILD_TOKEN={registered.BuildToken}"
        };
        return new(registered.AppId, registered.EnvironmentId, registered.BuildToken, configuration.Url!, request.Environment, values);
    }
}
