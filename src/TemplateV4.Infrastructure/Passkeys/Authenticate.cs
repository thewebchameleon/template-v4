using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class PasskeyService
{
    public async Task<PasskeyOptions> LoginOptions(HttpContext http, CancellationToken ct)
    {
        var options = await handler.MakeRequestOptionsAsync(null, http);
        var id = await security.Challenge(null, "passkey-login", options.AssertionState ?? "", "Passkey", ct);
        return new(id, JsonSerializer.Deserialize<JsonElement>(options.RequestOptionsJson));
    }
    public async Task<Result<AuthTokens>> Login(PasskeyCredential request, HttpContext http, CancellationToken ct)
    {
        if (request.Credential.ValueKind != JsonValueKind.Object) return Result<AuthTokens>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Session.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842003)", ct);
        var challenge = await security.Consume(request.ChallengeId, "passkey-login", ct);
        if (challenge is null) return Result<AuthTokens>.Fail("auth.challenge_expired", ErrorKind.Unauthorized);
        var result = await handler.PerformAssertionAsync(new() { HttpContext = http, CredentialJson = request.Credential.GetRawText(), AssertionState = challenge.State });
        if (!result.Succeeded) { await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<AuthTokens>.Fail("auth.factor_invalid", ErrorKind.Unauthorized); }
        var user = result.User!;
        await security.Lock(user.Id, ct); await db.Entry(user).ReloadAsync(ct);
        if (user.RegistrationState is "Pending" or "Rejected" || !user.EmailConfirmed || await users.IsLockedOutAsync(user) || !await db.Profiles.AnyAsync(x => x.Id == user.Id && !x.Disabled, ct))
        { await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<AuthTokens>.Fail("auth.invalid_credentials", ErrorKind.Unauthorized); }
        if (!(await users.AddOrUpdatePasskeyAsync(user, result.Passkey!)).Succeeded) throw new InvalidOperationException("Passkey update failed.");
        await users.ResetAccessFailedCountAsync(user);
        var tokens = await auth.CreateSession(user, challenge.Row.Device, http.Connection.RemoteIpAddress?.ToString(), true, ct, passkeyVerified: true);
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<AuthTokens>.Success(tokens);
    }
}
