using System.Text.Json;
using TemplateV4.Application.Users;

namespace TemplateV4.Application.Cms;

public sealed record ContentField(string Key, string Label, string Type, bool Required = false,
    string[]? Options = null, string? Collection = null, bool Multiple = false, ContentField[]? Fields = null);
public sealed record ContentWorkflow(bool Required = true, int Approvals = 1, bool AutoPublish = false,
    Guid[]? Users = null, Guid[]? Roles = null);
public sealed record ContentGrant(Guid RoleId, string Permission);
public sealed record SaveCollection(string Key, string Label, Guid? Version, ContentField[] Fields,
    ContentWorkflow Workflow, bool PublicRead = false);
public sealed record ContentCollection(string Key, string Label, Guid Version, ContentField[] Fields,
    ContentWorkflow Workflow, bool PublicRead, string[] Actions, ContentGrant[] Grants);
public sealed record ContentAccessOption(Guid Id, string Label);
public sealed record ContentAccessOptions(ContentAccessOption[] Users, ContentAccessOption[] Roles);
public sealed record SaveContentGrants(Guid Version, ContentGrant[] Grants);
public sealed record SaveContentItem(Guid? Id, Guid? Version, Dictionary<string, JsonElement> Values);
public sealed record ContentTransition(Guid Version, string Action, string? Comment = null);
public sealed record ContentDecision(Guid ReviewerId, string State, string? Comment);
public sealed record ContentItem(Guid Id, string Collection, Guid Version, Guid RevisionId, string Title,
    string State, bool Published, bool PendingChanges, DateTimeOffset UpdatedAt, DateTimeOffset? PublishedAt,
    Dictionary<string, JsonElement> Values, ContentDecision[] Decisions, string[] Actions);
public sealed record ContentItemSummary(Guid Id, string Title, string State, bool Published, DateTimeOffset UpdatedAt);
public sealed record ContentQuery(int PageNumber = 1, int PageSize = 10, string Search = "", string Sort = "updatedAt",
    string Direction = "desc", string State = "all", string? Filter = null);
public sealed record PublishedContent(Guid Id, string Collection, DateTimeOffset PublishedAt,
    DateTimeOffset UpdatedAt, Dictionary<string, JsonElement> Values);
public sealed record ContentReadAccess(bool PublicOnly, string[] Collections);

public interface IContentCms
{
    Task<Result<ContentCollection[]>> Collections(CancellationToken ct);
    Task<Result<ContentCollection>> Collection(string key, CancellationToken ct);
    Task<Result<ContentCollection>> SaveCollection(SaveCollection request, CancellationToken ct);
    Task<Result<ContentCollection>> SaveGrants(string key, SaveContentGrants request, CancellationToken ct);
    Task<Result<ContentAccessOptions>> AccessOptions(CancellationToken ct);
    Task<Result<Page<ContentItemSummary>>> Items(string key, ContentQuery query, CancellationToken ct);
    Task<Result<ContentItem>> Item(string key, Guid id, CancellationToken ct);
    Task<Result<ContentItem>> Save(string key, SaveContentItem request, CancellationToken ct);
    Task<Result<ContentItem>> Transition(string key, Guid id, ContentTransition request, CancellationToken ct);
    Task<Result<Page<PublishedContent>>> Published(string key, ContentQuery query, string? fields, int expand, ContentReadAccess access, CancellationToken ct);
    Task<Result<PublishedContent>> PublishedItem(string key, Guid id, string? fields, int expand, ContentReadAccess access, CancellationToken ct);
}
