using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class PasskeyService
{
    public async Task<Result<PasskeyOptions>> RegistrationOptions(Guid id, PasskeyRegistrationRequest request, HttpContext http, CancellationToken ct)
    {
        if (request.Proof is null || request.DeviceId == Guid.Empty) return Result<PasskeyOptions>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var user = (await users.FindByIdAsync(id.ToString()))!;
        var sessionId = EndpointSession(http);
        var setupEnrollment = string.IsNullOrEmpty(request.Proof.Password);
        if (sessionId is null || await security.RequiresRecentVerification(user, sessionId.Value, ct) ||
            setupEnrollment && !await security.CanEnrollFromSetupSession(user, sessionId.Value, ct))
            return Result<PasskeyOptions>.Fail("auth.reauthentication_required", ErrorKind.Unauthorized);
        if (!setupEnrollment && !await security.Proof(user, request.Proof, ct)) { await tx.CommitAsync(ct); return Result<PasskeyOptions>.Fail("auth.factor_invalid", ErrorKind.Unauthorized); }
        if (await db.PasskeyDevices.AnyAsync(x => x.UserId == id && x.DeviceId == request.DeviceId, ct))
            return Result<PasskeyOptions>.Fail("auth.passkey_device_exists", ErrorKind.Conflict);
        if ((await users.GetPasskeysAsync(user)).Count >= 10) return Result<PasskeyOptions>.Fail("auth.passkey_limit", ErrorKind.Conflict);
        var options = await handler.MakeCreationOptionsAsync(new() { Id = id.ToString(), Name = user.Email!, DisplayName = user.Email! }, http);
        var challenge = await security.Challenge(user, "passkey-register", options.AttestationState ?? "", "", ct);
        await tx.CommitAsync(ct); return Result<PasskeyOptions>.Success(new(challenge, JsonSerializer.Deserialize<JsonElement>(options.CreationOptionsJson)));
    }
    public async Task<Result<Unit>> Register(Guid id, Guid sessionId, PasskeyRegistrationCredential request, HttpContext http, CancellationToken ct)
    {
        if (request.Credential.ValueKind != JsonValueKind.Object) return Result.Fail("validation.failed", ErrorKind.Validation);
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 80) return Result.Fail("validation.failed", ErrorKind.Validation);
        if (request.DeviceId == Guid.Empty) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var challenge = await security.Consume(request.ChallengeId, "passkey-register", ct);
        await security.Lock(id, ct); var user = (await users.FindByIdAsync(id.ToString()))!;
        if (await security.RequiresRecentVerification(user, sessionId, ct))
            return Result.Fail("auth.reauthentication_required", ErrorKind.Unauthorized);
        if (challenge is null || challenge.Row.UserId != id || challenge.Row.SecurityStamp != user.SecurityStamp) return Result.Fail("auth.challenge_expired", ErrorKind.Unauthorized);
        if (await db.PasskeyDevices.AnyAsync(x => x.UserId == id && x.DeviceId == request.DeviceId, ct))
            return Result.Fail("auth.passkey_device_exists", ErrorKind.Conflict);
        var result = await handler.PerformAttestationAsync(new() { HttpContext = http, CredentialJson = request.Credential.GetRawText(), AttestationState = challenge.State });
        if (!result.Succeeded || result.UserEntity!.Id != id.ToString())
        { await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Fail("auth.factor_invalid", ErrorKind.Validation); }
        // Never transfer a credential from another account.
        if (await users.FindByPasskeyIdAsync(result.Passkey!.CredentialId) is not null) return Result.Fail("auth.passkey_exists", ErrorKind.Conflict);
        result.Passkey.Name = request.Name.Trim();
        if (!(await users.AddOrUpdatePasskeyAsync(user, result.Passkey)).Succeeded) throw new InvalidOperationException("Passkey registration failed.");
        db.PasskeyDevices.Add(new() { CredentialId = result.Passkey.CredentialId, UserId = id, DeviceId = request.DeviceId });
        await security.Changed(user, sessionId, "auth.passkey_added", ct);
        await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<Unit>> Remove(Guid id, Guid sessionId, RemovePasskeyRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Id) || request.Id.Length > 1400) return Result.Fail("validation.failed", ErrorKind.Validation);
        byte[] key; try { key = WebEncoders.Base64UrlDecode(request.Id); } catch (FormatException) { return Result.Fail("validation.failed", ErrorKind.Validation); }
        await using var tx = await db.Database.BeginTransactionAsync(ct); var user = (await users.FindByIdAsync(id.ToString()))!;
        if (await security.RequiresRecentVerification(user, sessionId, ct))
            return Result.Fail("auth.reauthentication_required", ErrorKind.Unauthorized);
        if (!await security.Proof(user, request.Proof, ct)) { await tx.CommitAsync(ct); return Result.Fail("auth.factor_invalid", ErrorKind.Unauthorized); }
        if ((await security.PasskeyRequired(user, ct) || !user.EmailMfaEnabled && !user.TwoFactorEnabled && await security.GloballyRequired(user, ct)) && (await users.GetPasskeysAsync(user)).Count <= 1) return Result.Fail("auth.mfa_required", ErrorKind.Conflict);
        if (!(await users.RemovePasskeyAsync(user, key)).Succeeded) return Result.Fail("auth.passkey_missing", ErrorKind.NotFound);
        await security.Changed(user, sessionId, "auth.passkey_removed", ct);
        await tx.CommitAsync(ct); return Result.Success();
    }
}
