using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using TemplateV4.Application.ApiKeys;

namespace TemplateV4.ApiService;

public static class ApiKeyAuthentication
{
    public const string Scheme = "ApiKey";

    public static bool TryReadId(string credential, out Guid id)
    {
        id = default;
        return credential.Length == 101 && credential.StartsWith("tv4_", StringComparison.Ordinal) && credential[36] == '.' &&
            Guid.TryParseExact(credential.AsSpan(4, 32), "N", out id);
    }
}

public sealed class ApiKeyAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IApiKeys keys) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var authorization = Request.Headers.Authorization.ToString();
        if (!authorization.StartsWith("ApiKey ", StringComparison.OrdinalIgnoreCase)) return AuthenticateResult.NoResult();
        var credential = authorization[7..].Trim();
        if (!ApiKeyAuthentication.TryReadId(credential, out var id)) return AuthenticateResult.Fail("Invalid API key.");
        var key = await keys.Authenticate(id, credential, Context.RequestAborted);
        if (key is null) return AuthenticateResult.Fail("Invalid API key.");
        var claims = new List<Claim>
        {
            new("api_key_id", key.Id.ToString()),
            new(ClaimTypes.Name, key.Name)
        };
        claims.AddRange(key.Scopes.Select(scope => new Claim("scope", scope)));
        claims.AddRange((key.Collections ?? []).Select(collection => new Claim("cms_collection", collection)));
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, ApiKeyAuthentication.Scheme, ClaimTypes.Name, ClaimTypes.Role));
        return AuthenticateResult.Success(new AuthenticationTicket(principal, ApiKeyAuthentication.Scheme));
    }
}
