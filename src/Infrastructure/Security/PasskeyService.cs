using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using templatev4.Application;
using templatev4.Infrastructure.Persistence;

namespace templatev4.Infrastructure.Security;

public sealed record PasskeyOptions(string ChallengeId, JsonElement Options);
public sealed record PasskeyCredential(string ChallengeId, JsonElement Credential, string Name = "Passkey");
public sealed record RemovePasskeyRequest(string Id, SecurityProof Proof);
public sealed class PasskeyService(FrameworkDb db, UserManager<AppUser> users, IPasskeyHandler<AppUser> handler, SecurityService security, AuthService auth)
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
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842003)", ct);
        var challenge = await security.Consume(request.ChallengeId, "passkey-login", ct);
        if (challenge is null) return Result<AuthTokens>.Fail("auth.challenge_expired", ErrorKind.Unauthorized);
        var result = await handler.PerformAssertionAsync(new() { HttpContext = http, CredentialJson = request.Credential.GetRawText(), AssertionState = challenge.State });
        if (!result.Succeeded) { await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<AuthTokens>.Fail("auth.factor_invalid", ErrorKind.Unauthorized); }
        var user = result.User!;
        await security.Lock(user.Id, ct); await db.Entry(user).ReloadAsync(ct);
        if (!user.EmailConfirmed || await users.IsLockedOutAsync(user) || !await db.Profiles.AnyAsync(x => x.Id == user.Id && !x.Disabled, ct))
        { await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<AuthTokens>.Fail("auth.invalid_credentials", ErrorKind.Unauthorized); }
        if (!(await users.AddOrUpdatePasskeyAsync(user, result.Passkey!)).Succeeded) throw new InvalidOperationException("Passkey update failed.");
        await users.ResetAccessFailedCountAsync(user);
        var tokens = await auth.CreateSession(user, challenge.Device, true, ct);
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<AuthTokens>.Success(tokens);
    }
    public async Task<Result<PasskeyOptions>> RegistrationOptions(Guid id, SecurityProof proof, HttpContext http, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var user = (await users.FindByIdAsync(id.ToString()))!;
        if (!await security.Proof(user, proof, ct)) { await tx.CommitAsync(ct); return Result<PasskeyOptions>.Fail("auth.factor_invalid", ErrorKind.Unauthorized); }
        if ((await users.GetPasskeysAsync(user)).Count >= 10) return Result<PasskeyOptions>.Fail("auth.passkey_limit", ErrorKind.Conflict);
        var options = await handler.MakeCreationOptionsAsync(new() { Id = id.ToString(), Name = user.Email!, DisplayName = user.Email! }, http);
        var challenge = await security.Challenge(user, "passkey-register", options.AttestationState ?? "", "", ct);
        await tx.CommitAsync(ct); return Result<PasskeyOptions>.Success(new(challenge, JsonSerializer.Deserialize<JsonElement>(options.CreationOptionsJson)));
    }
    public async Task<Result<Unit>> Register(Guid id, Guid sessionId, PasskeyCredential request, HttpContext http, CancellationToken ct)
    {
        if (request.Credential.ValueKind != JsonValueKind.Object) return Result.Fail("validation.failed", ErrorKind.Validation);
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 80) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var challenge = await security.Consume(request.ChallengeId, "passkey-register", ct);
        await security.Lock(id, ct); var user = (await users.FindByIdAsync(id.ToString()))!;
        if (challenge is null || challenge.UserId != id || challenge.SecurityStamp != user.SecurityStamp) return Result.Fail("auth.challenge_expired", ErrorKind.Unauthorized);
        var result = await handler.PerformAttestationAsync(new() { HttpContext = http, CredentialJson = request.Credential.GetRawText(), AttestationState = challenge.State });
        if (!result.Succeeded || result.UserEntity!.Id != id.ToString())
        { await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Fail("auth.factor_invalid", ErrorKind.Validation); }
        // Never transfer a credential from another account.
        if (await users.FindByPasskeyIdAsync(result.Passkey!.CredentialId) is not null) return Result.Fail("auth.passkey_exists", ErrorKind.Conflict);
        result.Passkey.Name = request.Name.Trim();
        if (!(await users.AddOrUpdatePasskeyAsync(user, result.Passkey)).Succeeded) throw new InvalidOperationException("Passkey registration failed.");
        await security.Changed(user, sessionId, "auth.passkey_added", ct);
        await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<Unit>> Remove(Guid id, Guid sessionId, RemovePasskeyRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Id) || request.Id.Length > 1400) return Result.Fail("validation.failed", ErrorKind.Validation);
        byte[] key; try { key = WebEncoders.Base64UrlDecode(request.Id); } catch (FormatException) { return Result.Fail("validation.failed", ErrorKind.Validation); }
        await using var tx = await db.Database.BeginTransactionAsync(ct); var user = (await users.FindByIdAsync(id.ToString()))!;
        if (!await security.Proof(user, request.Proof, ct)) { await tx.CommitAsync(ct); return Result.Fail("auth.factor_invalid", ErrorKind.Unauthorized); }
        if (!user.TwoFactorEnabled && await security.Required(user, ct) && (await users.GetPasskeysAsync(user)).Count <= 1) return Result.Fail("auth.mfa_required", ErrorKind.Conflict);
        if (!(await users.RemovePasskeyAsync(user, key)).Succeeded) return Result.Fail("auth.passkey_missing", ErrorKind.NotFound);
        await security.Changed(user, sessionId, "auth.passkey_removed", ct);
        await tx.CommitAsync(ct); return Result.Success();
    }
}
