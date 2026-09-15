using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;

namespace TemplateV4.Infrastructure.Security;

public sealed class SigningKeys : IDisposable
{
    private readonly List<RSA> _keys = [];
    public RsaSecurityKey Active { get; }
    public IReadOnlyList<SecurityKey> ValidationKeys { get; }
    public SigningKeys(IConfiguration configuration, IHostEnvironment environment)
    {
        var pem = configuration["Jwt:PrivateKeyBase64"] is { Length: > 0 } encoded
            ? System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(encoded))
            : File.ReadAllText(configuration["Jwt:PrivateKeyPath"] ?? throw new InvalidOperationException("Configure Jwt:PrivateKeyBase64 or Jwt:PrivateKeyPath."));
        var keyId = configuration["Jwt:KeyId"] ?? throw new InvalidOperationException("Jwt:KeyId is required.");
        var rsa = RSA.Create(); rsa.ImportFromPem(pem);
        if (rsa.KeySize < 3072) throw new InvalidOperationException("JWT signing keys must be at least 3072 bits.");
        _keys.Add(rsa); Active = new RsaSecurityKey(rsa) { KeyId = keyId };
        var keys = new List<SecurityKey> { Active };
        foreach (var retired in configuration.GetSection("Jwt:PreviousKeys").GetChildren())
        {
            var old = RSA.Create(); old.ImportFromPem(File.ReadAllText(retired["Path"]!)); _keys.Add(old);
            keys.Add(new RsaSecurityKey(old) { KeyId = retired["KeyId"] });
        }
        ValidationKeys = keys;
    }
    public void Dispose() { foreach (var key in _keys) key.Dispose(); }
}
