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
    private static ApiKeyItem View(ApiKeyRow row, string createdByName) => new(row.Id, row.Name, Prefix(row.Id), row.Scopes,
        row.CreatedAt, row.ExpiresAt, row.RevokedAt, row.LastUsedAt, row.RequestCount, createdByName);

    public async Task<Result<ApiKeyPage>> List(ApiKeyQuery query, CancellationToken ct)
    {
        if (!context.Permissions.Contains(Permissions.ApiKeysManage))
            return Result<ApiKeyPage>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (query.Search is null or { Length: > 200 } || query.PageNumber is < 1 or > 10000 ||
            query.PageSize is not (5 or 10 or 25 or 50) ||
            query.Sort is not ("name" or "prefix" or "createdAt" or "expiresAt" or "status" or "lastUsedAt" or "requestCount" or "createdByName") ||
            query.Direction is not ("asc" or "desc"))
            return Result<ApiKeyPage>.Fail("validation.failed", ErrorKind.Validation);

        var rows = db.Set<ApiKeyRow>().AsNoTracking();
        var search = query.Search.Trim();
        if (search.Length > 0)
            rows = rows.Where(x => x.Name.Contains(search) ||
                db.Profiles.IgnoreQueryFilters().Any(profile => profile.Id == x.CreatedBy && profile.DisplayName.Contains(search)));

        var total = await rows.CountAsync(ct);
        var now = time.GetUtcNow();
        var descending = query.Direction == "desc";
        var ordered = query.Sort switch
        {
            "name" => descending ? rows.OrderByDescending(x => x.Name) : rows.OrderBy(x => x.Name),
            "prefix" => descending ? rows.OrderByDescending(x => x.Id) : rows.OrderBy(x => x.Id),
            "expiresAt" => descending ? rows.OrderByDescending(x => x.ExpiresAt) : rows.OrderBy(x => x.ExpiresAt),
            "status" => descending
                ? rows.OrderByDescending(x => x.RevokedAt != null ? 2 : x.ExpiresAt != null && x.ExpiresAt <= now ? 1 : 0)
                : rows.OrderBy(x => x.RevokedAt != null ? 2 : x.ExpiresAt != null && x.ExpiresAt <= now ? 1 : 0),
            "lastUsedAt" => descending ? rows.OrderByDescending(x => x.LastUsedAt) : rows.OrderBy(x => x.LastUsedAt),
            "requestCount" => descending ? rows.OrderByDescending(x => x.RequestCount) : rows.OrderBy(x => x.RequestCount),
            "createdByName" => descending
                ? rows.OrderByDescending(x => db.Profiles.IgnoreQueryFilters().Where(profile => profile.Id == x.CreatedBy).Select(profile => profile.DisplayName).FirstOrDefault())
                : rows.OrderBy(x => db.Profiles.IgnoreQueryFilters().Where(profile => profile.Id == x.CreatedBy).Select(profile => profile.DisplayName).FirstOrDefault()),
            _ => descending ? rows.OrderByDescending(x => x.CreatedAt) : rows.OrderBy(x => x.CreatedAt)
        };
        var page = await ordered.ThenBy(x => x.Id)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new
            {
                Row = x,
                CreatedByName = db.Profiles.IgnoreQueryFilters().Where(profile => profile.Id == x.CreatedBy)
                    .Select(profile => profile.DisplayName).FirstOrDefault() ?? ""
            })
            .ToArrayAsync(ct);
        return Result<ApiKeyPage>.Success(new(page.Select(x => View(x.Row, x.CreatedByName)).ToArray(), total, query.PageNumber, query.PageSize));
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
        var created = Add(name, scopes, actor, request.ExpiresInDays is { } days ? now.AddDays(days) : null, now);
        await db.SaveChangesAsync(ct);
        return Result<ApiKeyCreated>.Success(created);
    }

    public async Task<Result<ApiKeyCreated>> Rotate(Guid id, CancellationToken ct)
    {
        if (!context.Permissions.Contains(Permissions.ApiKeysManage) || context.ActorId is not { } actor)
            return Result<ApiKeyCreated>.Fail("authorization.denied", ErrorKind.Forbidden);
        var row = await db.Set<ApiKeyRow>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        var now = time.GetUtcNow();
        if (row is null) return Result<ApiKeyCreated>.Fail("api_key.not_found", ErrorKind.NotFound);
        if (row.RevokedAt is not null || row.ExpiresAt <= now)
            return Result<ApiKeyCreated>.Fail("api_key.inactive", ErrorKind.Validation);

        var created = Add(row.Name, row.Scopes, actor, row.ExpiresAt, now, row.Id);
        await db.SaveChangesAsync(ct);
        return Result<ApiKeyCreated>.Success(created);
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

    public async Task<Result<Unit>> Delete(Guid id, CancellationToken ct)
    {
        if (!context.Permissions.Contains(Permissions.ApiKeysManage) || context.ActorId is not { } actor)
            return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var row = await db.Set<ApiKeyRow>().SingleOrDefaultAsync(x => x.Id == id, ct);
        var now = time.GetUtcNow();
        if (row is null) return Result.Fail("api_key.not_found", ErrorKind.NotFound);
        if (row.RevokedAt is null && (row.ExpiresAt is null || row.ExpiresAt > now))
            return Result.Fail("api_key.active", ErrorKind.Validation);

        db.Remove(row);
        db.Audit.Add(new()
        {
            ActorId = actor,
            SubjectId = row.Id,
            SubjectType = "api_key",
            SubjectNameSnapshot = row.Name,
            Action = "api_key.deleted",
            At = now
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

    private ApiKeyCreated Add(string name, string[] scopes, Guid actor, DateTimeOffset? expiresAt, DateTimeOffset now, Guid? rotatedFrom = null)
    {
        var row = new ApiKeyRow
        {
            Id = Guid.NewGuid(),
            Name = name,
            Scopes = scopes,
            CreatedBy = actor,
            CreatedAt = now,
            ExpiresAt = expiresAt
        };
        var secret = $"tv4_{row.Id:N}.{Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(32))}";
        row.SecretHash = SHA256.HashData(Encoding.UTF8.GetBytes(secret));
        db.Add(row);
        var changes = rotatedFrom is { } source
            ? AuditCapture.Changes(new AuditChange("scopes", null, string.Join(", ", scopes)),
                new("expiresAt", null, row.ExpiresAt?.ToString("O")), new("rotatedFrom", null, source.ToString()))
            : AuditCapture.Changes(new AuditChange("scopes", null, string.Join(", ", scopes)),
                new("expiresAt", null, row.ExpiresAt?.ToString("O")));
        db.Audit.Add(new()
        {
            ActorId = actor,
            SubjectId = row.Id,
            SubjectType = "api_key",
            SubjectNameSnapshot = row.Name,
            Action = "api_key.created",
            ChangesJson = changes,
            At = now
        });
        return new(View(row, ""), secret);
    }
}
