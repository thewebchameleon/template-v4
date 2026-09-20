using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class PasskeyService
{
    private sealed record PasskeyMfaState(string AssertionState, string LoginChallengeId);
    public async Task<Result<PasskeyOptions>> MfaOptions(PasskeyChallengeRequest request, HttpContext http, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var loginChallenge = await security.ReadChallenge(request.ChallengeId, "mfa-login", ct);
        var user = loginChallenge?.Row.UserId is { } id ? await users.FindByIdAsync(id.ToString()) : null;
        if (user is null || loginChallenge!.Row.SecurityStamp != user.SecurityStamp || !(await security.ConfiguredMethods(user)).Contains(MfaMethods.Passkey))
        { await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<PasskeyOptions>.Fail("auth.challenge_expired", ErrorKind.Unauthorized); }
        var options = await handler.MakeRequestOptionsAsync(user, http);
        var state = JsonSerializer.Serialize(new PasskeyMfaState(options.AssertionState ?? "", request.ChallengeId));
        var challenge = await security.Challenge(user, "passkey-mfa", state, loginChallenge.Row.Device, ct);
        await tx.CommitAsync(ct);
        return Result<PasskeyOptions>.Success(new(challenge, JsonSerializer.Deserialize<JsonElement>(options.RequestOptionsJson)));
    }
    public async Task<Result<AuthTokens>> CompleteMfa(PasskeyCredential request, HttpContext http, CancellationToken ct)
    {
        if (request.Credential.ValueKind != JsonValueKind.Object) return Result<AuthTokens>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var challenge = await security.Consume(request.ChallengeId, "passkey-mfa", ct);
        var state = challenge is null ? null : JsonSerializer.Deserialize<PasskeyMfaState>(challenge.State);
        var loginChallenge = state is null ? null : await security.ReadChallenge(state.LoginChallengeId, "mfa-login", ct);
        var user = challenge?.Row.UserId is { } id ? await users.FindByIdAsync(id.ToString()) : null;
        if (user is null || challenge is null || state is null || loginChallenge is null || challenge.Row.SecurityStamp != user.SecurityStamp || loginChallenge.Row.UserId != user.Id || loginChallenge.Row.SecurityStamp != user.SecurityStamp)
        { await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<AuthTokens>.Fail("auth.challenge_expired", ErrorKind.Unauthorized); }
        await security.Lock(user.Id, ct); await db.Entry(user).ReloadAsync(ct);
        if (user.RegistrationState is "Pending" or "Rejected" || challenge.Row.SecurityStamp != user.SecurityStamp || loginChallenge.Row.SecurityStamp != user.SecurityStamp)
            return Result<AuthTokens>.Fail("auth.challenge_expired", ErrorKind.Unauthorized);
        var result = await handler.PerformAssertionAsync(new() { HttpContext = http, CredentialJson = request.Credential.GetRawText(), AssertionState = state.AssertionState });
        if (!result.Succeeded || result.User?.Id != user.Id)
        { await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<AuthTokens>.Fail("auth.factor_invalid", ErrorKind.Unauthorized); }
        db.AuthChallenges.Remove(loginChallenge.Row);
        if (!(await users.AddOrUpdatePasskeyAsync(user, result.Passkey!)).Succeeded) throw new InvalidOperationException("Passkey update failed.");
        await users.ResetAccessFailedCountAsync(user);
        var tokens = await auth.CreateSession(user, challenge.Row.Device, http.Connection.RemoteIpAddress?.ToString(), true, ct, passkeyVerified: true);
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<AuthTokens>.Success(tokens);
    }
}
