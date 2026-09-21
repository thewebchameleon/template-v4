namespace TemplateV4.Application.ApiKeys;

public static class ApiScopes
{
    public const string CmsArticlesRead = "cms.articles.read";
    public const string CmsSectionsRead = "cms.sections.read";
    public static readonly string[] All = [CmsArticlesRead, CmsSectionsRead];
}

public sealed record ApiKeyItem(
    Guid Id,
    string Name,
    string Prefix,
    string[] Scopes,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ExpiresAt,
    DateTimeOffset? RevokedAt,
    DateTimeOffset? LastUsedAt,
    long RequestCount,
    string CreatedByName);

public sealed record ApiKeyQuery(string Search = "", int PageNumber = 1, int PageSize = 10, string Sort = "createdAt", string Direction = "desc");
public sealed record ApiKeyPage(IReadOnlyList<ApiKeyItem> Items, int Total, int PageNumber, int PageSize);
public sealed record CreateApiKey(string Name, string[] Scopes, int? ExpiresInDays);
public sealed record ApiKeyCreated(ApiKeyItem Key, string Secret);
public sealed record ApiKeyIdentity(Guid Id, string Name, string[] Scopes);

public interface IApiKeys
{
    Task<Result<ApiKeyPage>> List(ApiKeyQuery query, CancellationToken ct);
    Task<Result<ApiKeyCreated>> Create(CreateApiKey request, CancellationToken ct);
    Task<Result<ApiKeyCreated>> Rotate(Guid id, CancellationToken ct);
    Task<Result<Unit>> Revoke(Guid id, CancellationToken ct);
    Task<Result<Unit>> Delete(Guid id, CancellationToken ct);
    Task<ApiKeyIdentity?> Authenticate(Guid id, string credential, CancellationToken ct);
}
