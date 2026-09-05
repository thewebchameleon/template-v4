using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using templatev4.Application;
using templatev4.Domain.Users;
using templatev4.Infrastructure.Persistence;

namespace templatev4.Infrastructure.Security;

public sealed record AdminBootstrapRequest(string Token, string Username, string Password);
public sealed record AdminBootstrapStatus(bool Available);

public sealed class AdminBootstrapToken
{
    private byte[]? _hash;

    public bool Available => Volatile.Read(ref _hash) is not null;

    public void Enable(TextWriter? output = null)
    {
        var raw = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        Volatile.Write(ref _hash, SHA256.HashData(Encoding.UTF8.GetBytes(raw)));
        // This one-time secret deliberately bypasses structured logging and its enrichers/sinks.
        (output ?? Console.Out).WriteLine($"Administrator bootstrap token: {raw}");
    }

    public bool Matches(string? raw)
    {
        var expected = Volatile.Read(ref _hash);
        if (expected is null || string.IsNullOrWhiteSpace(raw) || raw.Length > 128) return false;
        return CryptographicOperations.FixedTimeEquals(expected, SHA256.HashData(Encoding.UTF8.GetBytes(raw)));
    }

    public void Disable() => Volatile.Write(ref _hash, null);
}

public sealed class AdminBootstrapService(FrameworkDb db, UserManager<AppUser> users, AdminBootstrapToken token, CultureCatalog cultures, TimeProvider time)
{
    public async Task<bool> Initialize(CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842002)", ct);
        var settings = await db.SecuritySettings.SingleOrDefaultAsync(ct);
        if (settings?.BootstrapCompletedAt is not null)
        {
            token.Disable();
            await transaction.CommitAsync(ct);
            return false;
        }
        if (await AdministratorExists(ct))
        {
            settings ??= AddSettings();
            settings.BootstrapCompletedAt = time.GetUtcNow();
            await db.SaveChangesAsync(ct);
            token.Disable();
            await transaction.CommitAsync(ct);
            return false;
        }
        await transaction.CommitAsync(ct);
        return true;
    }

    public async Task<bool> Available(CancellationToken ct) =>
        token.Available && !await db.SecuritySettings.AnyAsync(settings => settings.BootstrapCompletedAt != null, ct) && !await AdministratorExists(ct);

    public async Task<Result<Unit>> Create(AdminBootstrapRequest request, CancellationToken ct)
    {
        if (await db.SecuritySettings.AnyAsync(settings => settings.BootstrapCompletedAt != null, ct) || await AdministratorExists(ct))
        {
            token.Disable();
            return Result.Fail("bootstrap.unavailable", ErrorKind.NotFound);
        }
        if (!token.Matches(request.Token)) return Result.Fail("bootstrap.invalid", ErrorKind.Unauthorized);
        if (string.IsNullOrWhiteSpace(request.Username) || request.Username.Length is < 3 or > 64 ||
            request.Username.Any(character => !(char.IsAsciiLetterOrDigit(character) || character is '-' or '_' or '.')) ||
            string.IsNullOrWhiteSpace(request.Password) || request.Password.Length > 1024)
            return Result.Fail("validation.failed", ErrorKind.Validation);

        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        // One database-wide lock makes competing API replicas agree which request creates the first administrator.
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842002)", ct);
        var settings = await db.SecuritySettings.SingleOrDefaultAsync(ct);
        if (settings?.BootstrapCompletedAt is not null || await AdministratorExists(ct))
        {
            if (settings?.BootstrapCompletedAt is null)
            {
                settings ??= AddSettings();
                settings.BootstrapCompletedAt = time.GetUtcNow();
                await db.SaveChangesAsync(ct);
            }
            await transaction.CommitAsync(ct);
            token.Disable();
            return Result.Fail("bootstrap.unavailable", ErrorKind.NotFound);
        }

        var role = await db.Roles.SingleOrDefaultAsync(candidate => candidate.NormalizedName == "ADMINISTRATOR", ct);
        if (role is null) throw new InvalidOperationException("The Administrator role must be seeded before API startup.");

        var id = Guid.NewGuid();
        var emailHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(request.Username.Trim().ToUpperInvariant())))[..24].ToLowerInvariant();
        var user = new AppUser
        {
            Id = id,
            UserName = request.Username.Trim(),
            Email = $"bootstrap-{emailHash}@example.invalid",
            EmailConfirmed = true
        };
        var created = await users.CreateAsync(user, request.Password);
        if (!created.Succeeded)
        {
            await transaction.RollbackAsync(ct);
            var duplicate = created.Errors.Any(error => error.Code is "DuplicateUserName" or "DuplicateEmail");
            return Result.Fail(duplicate ? "bootstrap.username_exists" : "validation.failed", duplicate ? ErrorKind.Conflict : ErrorKind.Validation);
        }
        if (!(await users.AddToRoleAsync(user, "Administrator")).Succeeded)
            throw new InvalidOperationException("Administrator role assignment failed.");

        var profile = UserProfile.Create(id, user.UserName, cultures.DefaultCulture);
        profile.ClearEvents();
        db.Profiles.Add(profile);
        db.Audit.Add(new() { Action = "bootstrap.administrator", SubjectId = id, At = time.GetUtcNow() });
        settings ??= AddSettings();
        settings.BootstrapCompletedAt = time.GetUtcNow();
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        token.Disable();
        return Result.Success();
    }

    private Task<bool> AdministratorExists(CancellationToken ct) =>
        (from membership in db.UserRoles
         join role in db.Roles on membership.RoleId equals role.Id
         where role.NormalizedName == "ADMINISTRATOR"
         select membership.UserId).AnyAsync(ct);

    private SecuritySettings AddSettings()
    {
        var settings = new SecuritySettings();
        db.SecuritySettings.Add(settings);
        return settings;
    }
}
