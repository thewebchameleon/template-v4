using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.ApiKeys;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;
using IExecutionContext = TemplateV4.SharedKernel.IExecutionContext;

namespace TemplateV4.Infrastructure.ApiKeys;

public sealed class ApiKeyService(FrameworkDb db, IExecutionContext context, TimeProvider time) : IApiKeys
{
    private static string Prefix(Guid id) => $"tv4_{id:N}"[..12];
    private static ApiKeyItem View(ApiKeyRow row) => new(row.Id, row.Name, Prefix(row.Id), row.Scopes,
        row.CreatedAt, row.ExpiresAt, row.RevokedAt, row.LastUsedAt, row.RequestCount);

    public async Task<Result<ApiKeyItem[]>> List(CancellationToken ct)
    {
        if (!context.Permissions.Contains(Permissions.ApiKeysManage))
            return Result<ApiKeyItem[]>.Fail("authorization.denied", ErrorKind.Forbidden);
        var rows = await db.Set<ApiKeyRow>().AsNoTracking().OrderByDescending(x => x.CreatedAt).ThenBy(x => x.Id).ToArrayAsync(ct);
        return Result<ApiKeyItem[]>.Success(rows.Select(View).ToArray());
    }

    public async Task<Result<ApiKeyCreated>> Create(CreateApiKey request, CancellationToken ct)
    {
        if (!context.Permissions.Contains(Permissions.ApiKeysManage) || context.ActorId is not { } actor)
            return Result<ApiKeyCreated>.Fail("authorization.denied", ErrorKind.Forbidden);
        var name = request.Name?.Trim() ?? "";
        var scopes = request.Scopes?.Distinct(StringComparer.Ordinal).Order(StringComparer.Ordinal).ToArray() ?? [];
        if (name.Length is < 2 or > 100 || name.Any(char.IsControl) || scopes.Length is < 1 or > 20 || scopes.Any(x => !ApiScopes.All.Contains(x, StringComparer.Ordinal)) ||
            request.ExpiresInDays is < 1 or > 730)
            return Result<ApiKeyCreated>.Fail("api_key.invalid", ErrorKind.Validation);

        var now = time.GetUtcNow();
        var row = new ApiKeyRow
        {
            Id = Guid.NewGuid(),
            Name = name,
            Scopes = scopes,
            CreatedBy = actor,
            CreatedAt = now,
            ExpiresAt = request.ExpiresInDays is { } days ? now.AddDays(days) : null
        };
        var secret = $"tv4_{row.Id:N}.{Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(32))}";
        row.SecretHash = SHA256.HashData(Encoding.UTF8.GetBytes(secret));
        db.Add(row);
        db.Audit.Add(new()
        {
            ActorId = actor,
            SubjectId = row.Id,
            SubjectType = "api_key",
            SubjectNameSnapshot = row.Name,
            Action = "api_key.created",
            ChangesJson = AuditCapture.Changes(new AuditChange("scopes", null, string.Join(", ", scopes)),
                new("expiresAt", null, row.ExpiresAt?.ToString("O"))),
            At = now
        });
        await db.SaveChangesAsync(ct);
        return Result<ApiKeyCreated>.Success(new(View(row), secret));
    }

    public async Task<Result<Unit>> Revoke(Guid id, CancellationToken ct)
    {
        if (!context.Permissions.Contains(Permissions.ApiKeysManage) || context.ActorId is not { } actor)
            return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var row = await db.Set<ApiKeyRow>().SingleOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return Result.Fail("api_key.not_found", ErrorKind.NotFound);
        if (row.RevokedAt is not null) return Result.Success();
        row.RevokedAt = time.GetUtcNow();
        db.Audit.Add(new()
        {
            ActorId = actor,
            SubjectId = row.Id,
            SubjectType = "api_key",
            SubjectNameSnapshot = row.Name,
            Action = "api_key.revoked",
            At = row.RevokedAt.Value
        });
        await db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<ApiKeyIdentity?> Authenticate(Guid id, string credential, CancellationToken ct)
    {
        var now = time.GetUtcNow();
        var row = await db.Set<ApiKeyRow>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        if (row is null || row.RevokedAt is not null || row.ExpiresAt <= now) return null;
        var supplied = SHA256.HashData(Encoding.UTF8.GetBytes(credential));
        if (row.SecretHash.Length != supplied.Length || !CryptographicOperations.FixedTimeEquals(row.SecretHash, supplied)) return null;
        var updated = await db.Set<ApiKeyRow>().Where(x => x.Id == id && x.RevokedAt == null && (x.ExpiresAt == null || x.ExpiresAt > now))
            .ExecuteUpdateAsync(update => update.SetProperty(x => x.LastUsedAt, now).SetProperty(x => x.RequestCount, x => x.RequestCount + 1), ct);
        if (updated != 1) return null;
        return new(row.Id, row.Name, row.Scopes);
    }
}
