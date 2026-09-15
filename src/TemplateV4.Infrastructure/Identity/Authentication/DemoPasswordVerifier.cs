using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Npgsql;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

/// <summary>Fresh password proof for destructive demo activation. Attempts commit independently of the settings transaction.</summary>
public sealed class DemoPasswordVerifier(FrameworkDb db, IConfiguration configuration, TimeProvider time, IPasswordHasher<AppUser> passwords)
{
    public async Task<bool> Verify(Guid actor, string? password, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(password) || password.Length > 1024) return false;
        var now = time.GetUtcNow();
        var bucket = AuthService.Hash($"demo-password:{actor}:{now.ToUnixTimeSeconds() / 900}");
        // An independent connection prevents failed commands rolling back the attempt limit.
        await using var connection = new NpgsqlConnection(configuration.GetConnectionString("app"));
        await connection.OpenAsync(ct);
        await using var command = new NpgsqlCommand("INSERT INTO identity.rate_buckets (\"Id\", \"Count\", \"ExpiresAt\") VALUES ($1, 1, $2) ON CONFLICT (\"Id\") DO UPDATE SET \"Count\" = identity.rate_buckets.\"Count\" + 1 WHERE identity.rate_buckets.\"Count\" < 5", connection);
        command.Parameters.AddWithValue(bucket);
        command.Parameters.AddWithValue(now.AddMinutes(15));
        if (await command.ExecuteNonQueryAsync(ct) == 0) return false;
        var user = await db.Users.AsNoTracking().SingleOrDefaultAsync(x => x.Id == actor, ct);
        return user is { EmailConfirmed: true, PasswordHash: not null } &&
            !(user.LockoutEnabled && user.LockoutEnd > now) &&
            await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct) &&
            passwords.VerifyHashedPassword(user, user.PasswordHash, password) != PasswordVerificationResult.Failed;
    }
}
