using System.Security.Cryptography;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class SecurityService
{
    public async Task<string> Challenge(AppUser? user, string purpose, string state, string? device, CancellationToken ct, TimeSpan? lifetime = null)
    {
        var raw = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        db.AuthChallenges.Add(new() { Id = AuthService.Hash(raw), UserId = user?.Id, SecurityStamp = user?.SecurityStamp ?? "", Purpose = purpose, State = protector.Protect(state), Device = (device ?? "Browser")[..Math.Min(device?.Length ?? 7, 200)], ExpiresAt = time.GetUtcNow().Add(lifetime ?? TimeSpan.FromMinutes(5)) });
        await db.SaveChangesAsync(ct); return raw;
    }
    // Caller owns a transaction. Read and consume lock the row across replicas.
    public async Task<AuthenticationChallenge?> ReadChallenge(string raw, string purpose, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(raw) || raw.Length > 128) return null;
        var hash = AuthService.Hash(raw);
        // Always acquire the account lock before the challenge row, including MFA and passkey flows.
        var subject = await db.AuthChallenges.AsNoTracking().Where(x => x.Id == hash).Select(x => x.UserId).SingleOrDefaultAsync(ct);
        if (subject is { } userId) await Lock(userId, ct);
        var row = await db.AuthChallenges.FromSqlInterpolated($"SELECT * FROM identity.auth_challenges WHERE \"Id\" = {hash} FOR UPDATE").SingleOrDefaultAsync(ct);
        if (row is null || row.Purpose != purpose || row.ExpiresAt <= time.GetUtcNow()) return null;
        return new(row, protector.Unprotect(row.State));
    }
    public void SetChallengeState(AuthenticationChallenge challenge, string state) => challenge.Row.State = protector.Protect(state);
    public async Task<AuthenticationChallenge?> Consume(string raw, string purpose, CancellationToken ct)
    {
        var challenge = await ReadChallenge(raw, purpose, ct);
        if (challenge is not null) db.AuthChallenges.Remove(challenge.Row);
        return challenge;
    }
}
