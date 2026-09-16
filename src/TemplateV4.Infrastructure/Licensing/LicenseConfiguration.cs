using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Licensing;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Modules;

namespace TemplateV4.Infrastructure.Licensing;

public sealed class LicenseConfiguration
{
    public Guid DeploymentId { get; }
    public Guid OrganizationId { get; }
    public string? Url { get; }
    public string? Token { get; }
    public string? PublicKey { get; }
    public string[] RequiredModules { get; }
    public bool Configured => DeploymentId != Guid.Empty;
    public LicenseConfiguration(IConfiguration configuration, ModuleCatalog catalog)
    {
        RequiredModules = catalog.Definitions.Where(x => x.LicenseRequired).Select(x => x.Id)
            .Concat(configuration.GetSection("Licensing:RequiredModules").Get<string[]>() ?? []).Distinct().ToArray();
        if (RequiredModules.Any(id => !catalog.Definitions.Any(x => x.Id == id && !x.Required)))
            throw new InvalidOperationException("Only known optional modules can require a commercial license.");
        DeploymentId = configuration.GetValue<Guid>("Licensing:DeploymentId");
        OrganizationId = configuration.GetValue<Guid>("Licensing:OrganizationId");
        Url = configuration["Licensing:Url"]; Token = configuration["Licensing:Token"];
        PublicKey = configuration["Licensing:PublicKey"];
        if ((RequiredModules.Length > 0 || Configured) && (!Configured || OrganizationId == Guid.Empty ||
            !ReleaseVersions.Https(Url) || string.IsNullOrWhiteSpace(Token) || string.IsNullOrWhiteSpace(PublicKey)))
            throw new InvalidOperationException("Licensed deployments require identity, HTTPS endpoint, credential and signing public key.");
    }

    public DeploymentLicense? Verify(SignedDeploymentLicense signed, DateTimeOffset now)
    {
        try
        {
            if (signed.Payload.Length > 131072 || signed.Signature.Length > 2048) return null;
            using var key = ECDsa.Create(); key.ImportFromPem(PublicKey);
            if (!key.VerifyData(Encoding.UTF8.GetBytes(signed.Payload), Convert.FromBase64String(signed.Signature), HashAlgorithmName.SHA256)) return null;
            var license = JsonSerializer.Deserialize<DeploymentLicense>(signed.Payload, Updates.UpdateConfiguration.Json);
            return license is not null && license.DeploymentId == DeploymentId && license.OrganizationId == OrganizationId &&
                license.Revision > 0 && LicensePolicy.Fresh(license, now) && license.Modules is { Length: <= 100 } && license.Modules.All(x => x is not null) &&
                license.Modules.Select(x => x.Id).Distinct().Count() == license.Modules.Length ? license : null;
        }
        catch (Exception e) when (e is CryptographicException or FormatException or JsonException or ArgumentException) { return null; }
    }
}
