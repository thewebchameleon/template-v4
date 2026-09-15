using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class PasskeyService(FrameworkDb db, UserManager<AppUser> users, IPasskeyHandler<AppUser> handler, SecurityService security, AuthService auth)
{
    private static Guid? EndpointSession(HttpContext http) =>
        Guid.TryParse(http.User.FindFirst("sid")?.Value, out var sessionId) ? sessionId : null;
}

public sealed record PasskeyOptions(string ChallengeId, JsonElement Options);

public sealed record PasskeyCredential(string ChallengeId, JsonElement Credential, string Name = "Passkey");

public sealed record PasskeyChallengeRequest(string ChallengeId);

public sealed record RemovePasskeyRequest(string Id, SecurityProof Proof);
