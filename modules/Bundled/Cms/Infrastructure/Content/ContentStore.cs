using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Cms;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;
using IExecutionContext = TemplateV4.SharedKernel.IExecutionContext;

namespace TemplateV4.Infrastructure.Cms;

public sealed partial class ContentStore(CmsDb db, IExecutionContext context, ICapabilities capabilities,
    IActionItems actionItems, TimeProvider time, Security.AccessManagementService roleAccess, TemplateV4.Application.FileStorage.IFileReferences files) : IContentCms
{
    internal static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    internal static T Decode<T>(string json) => JsonSerializer.Deserialize<T>(json, Json)!;
    internal static string Encode<T>(T value) => JsonSerializer.Serialize(value, Json);
    private Task<ContentCollectionRow?> Find(string key, CancellationToken ct) => db.Set<ContentCollectionRow>().SingleOrDefaultAsync(x => x.Key == key, ct);
    internal async Task<bool> Allowed(Guid actor, string key, string permission, CancellationToken ct)
    {
        if (!Permissions.CmsActions.Contains(permission)) return false;
        var roles = db.UserRoles.Where(x => x.UserId == actor).Select(x => x.RoleId);
        if (!await db.Users.AnyAsync(x => x.Id == actor && x.EmailConfirmed && (x.RegistrationState == "Approved" || x.RegistrationState == "NotRequired"), ct) ||
            !await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct)) return false;
        var permissions = db.RoleClaims.Where(x => roles.Contains(x.RoleId) && x.ClaimType == "permission").Select(x => x.ClaimValue);
        return await permissions.ContainsAsync(permission, ct) ||
            key == "articles" && permission is Permissions.CmsRead or Permissions.CmsWrite or Permissions.CmsPublish && await permissions.ContainsAsync(Permissions.CmsEdit, ct) ||
            await db.Set<ContentGrantRow>().AnyAsync(x => x.Collection == key && roles.Contains(x.RoleId) && x.Permission == permission, ct);
    }
    private async Task<bool> Can(string key, string permission, CancellationToken ct) =>
        context.ActorId is { } actor && await Allowed(actor, key, permission, ct);
    private async Task<string[]> Actions(string key, CancellationToken ct)
    {
        var actions = new List<string>();
        foreach (var action in Permissions.CmsActions) if (await Can(key, action, ct)) actions.Add(action);
        return actions.ToArray();
    }
    private async Task<bool> Readable(string key, CancellationToken ct) => (await Actions(key, ct)).Any(x => x != Permissions.CmsSchema);
    private Task<bool> Enabled(CancellationToken ct) => capabilities.Enabled(CapabilityIds.Cms, ct);
    private Task<bool> RuntimeEnabled(CancellationToken ct) => db.RuntimeModules.AnyAsync(x => x.Id == "cms" && x.Enabled, ct);
    private static Result<T> Invalid<T>(string code = "validation.failed") => Result<T>.Fail(code, ErrorKind.Validation);
    private static Result<T> Missing<T>() => Result<T>.Fail("resource.not_found", ErrorKind.NotFound);
    private static Result<T> Denied<T>() => Result<T>.Fail("access.forbidden", ErrorKind.Forbidden);
    private static Result<T> Conflict<T>() => Result<T>.Fail("concurrency.conflict", ErrorKind.Conflict);
    // Serialize CMS state and access mutations across instances; account changes use this same lock.
    private async Task MutationLock(CancellationToken ct)
    {
        await Modules.ModuleActivationStore.LockRows(db, ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", ct);
    }
    private void Audit(Guid id, string action) => db.Audit.Add(new() { ActorId = context.ActorId, SubjectId = id,
        SubjectType = "cms.content", Action = action, At = time.GetUtcNow() });
    private async Task<ContentCollection> View(ContentCollectionRow row, CancellationToken ct) => new(row.Key, row.Label, row.Version,
        Decode<ContentField[]>(row.Fields), Decode<ContentWorkflow>(row.Workflow), row.PublicRead, await Actions(row.Key, ct),
        context.Permissions.Contains(Permissions.Roles) ? await db.Set<ContentGrantRow>().Where(x => x.Collection == row.Key)
            .Select(x => new ContentGrant(x.RoleId, x.Permission)).ToArrayAsync(ct) : []);
    public async Task<Result<ContentCollection[]>> Collections(CancellationToken ct)
    {
        if (!await Enabled(ct)) return Missing<ContentCollection[]>();
        var result = new List<ContentCollection>();
        foreach (var row in await db.Set<ContentCollectionRow>().OrderBy(x => x.Label).ToArrayAsync(ct))
            if ((await Actions(row.Key, ct)).Length > 0 || context.Permissions.Contains(Permissions.Roles)) result.Add(await View(row, ct));
        return Result<ContentCollection[]>.Success(result.ToArray());
    }
    public async Task<Result<ContentCollection>> Collection(string key, CancellationToken ct)
    {
        if (!await Enabled(ct)) return Missing<ContentCollection>();
        if ((await Actions(key, ct)).Length == 0 && !context.Permissions.Contains(Permissions.Roles)) return Denied<ContentCollection>();
        var row = await Find(key, ct);
        return row is null ? Missing<ContentCollection>() : Result<ContentCollection>.Success(await View(row, ct));
    }
    public async Task<Result<ContentAccessOptions>> AccessOptions(CancellationToken ct)
    {
        if (!await Enabled(ct)) return Missing<ContentAccessOptions>();
        if (context.ActorId is null || !(context.Permissions.Contains(Permissions.Roles) ||
            (await Collections(ct)).Value?.Any(x => x.Actions.Contains(Permissions.CmsSchema)) == true)) return Denied<ContentAccessOptions>();
        return Result<ContentAccessOptions>.Success(new(
            await db.Profiles.Where(x => !x.Disabled).OrderBy(x => x.DisplayName).Select(x => new ContentAccessOption(x.Id, x.DisplayName)).ToArrayAsync(ct),
            await db.Roles.OrderBy(x => x.Name).Select(x => new ContentAccessOption(x.Id, x.Name!)).ToArrayAsync(ct)));
    }
    public async Task<Result<ContentCollection>> SaveCollection(SaveCollection request, CancellationToken ct)
    {
        if (!await Enabled(ct)) return Missing<ContentCollection>();
        await using var tx = await db.Session.BeginTransactionAsync(ct); await MutationLock(ct);
        if (!await RuntimeEnabled(ct)) return Missing<ContentCollection>();
        if (!await Can(request.Key, Permissions.CmsSchema, ct)) return Denied<ContentCollection>();
        if (request.Key is null or "access-options" || !Regex.IsMatch(request.Key, "^[a-z][a-z0-9-]{0,63}$") || string.IsNullOrWhiteSpace(request.Label) || request.Label.Length > 120 ||
            !ValidFields(request.Fields) || request.Workflow is null || request.Workflow.Approvals is < 1 or > 20) return Invalid<ContentCollection>();
        var row = await Find(request.Key, ct);
        if (row is null && request.Version is not null || row is not null && row.Version != request.Version) return Conflict<ContentCollection>();
        if (row is not null && !Compatible(Decode<ContentField[]>(row.Fields), request.Fields)) return Invalid<ContentCollection>("cms.schema_incompatible");
        if (request.Key == "articles" && row is not null && !request.PublicRead) return Invalid<ContentCollection>("cms.articles_public");
        var targets = Flatten(request.Fields).Where(x => x.Type == "reference").Select(x => x.Collection!).Distinct().ToArray();
        if (await db.Set<ContentCollectionRow>().CountAsync(x => targets.Contains(x.Key) && x.Key != request.Key, ct) != targets.Count(x => x != request.Key)) return Invalid<ContentCollection>();
        var users = request.Workflow.Users ?? []; var roles = request.Workflow.Roles ?? [];
        if (await db.Users.CountAsync(x => users.Contains(x.Id), ct) != users.Distinct().Count() || await db.Roles.CountAsync(x => roles.Contains(x.Id), ct) != roles.Distinct().Count()) return Invalid<ContentCollection>();
        // Existing revisions retain their schema; new required fields need an explicit content migration.
        if (row is not null && await db.Set<ContentItemRow>().AnyAsync(x => x.Collection == row.Key, ct) &&
            AddsRequired(Decode<ContentField[]>(row.Fields), request.Fields)) return Invalid<ContentCollection>("cms.required_field_migration");
        if (row is null) { row = new() { Key = request.Key }; db.Add(row); }
        row.Label = request.Label.Trim(); row.Version = Guid.NewGuid(); row.Fields = Encode(request.Fields);
        row.Workflow = Encode(request.Workflow); row.PublicRead = request.PublicRead;
        db.Add(new ContentSchemaRow { Id = row.Version, Collection = row.Key, Fields = row.Fields });
        Audit(row.Version, "cms.schema.saved"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<ContentCollection>.Success(await View(row, ct));
    }
    public async Task<Result<ContentCollection>> SaveGrants(string key, SaveContentGrants request, CancellationToken ct)
    {
        if (!await Enabled(ct)) return Missing<ContentCollection>();
        await using var tx = await db.Session.BeginTransactionAsync(ct); await MutationLock(ct);
        if (!(await roleAccess.ActorPermissions(ct)).Contains(Permissions.Roles)) return Denied<ContentCollection>();
        if (!await RuntimeEnabled(ct)) return Missing<ContentCollection>();
        var row = await Find(key, ct); if (row is null) return Missing<ContentCollection>();
        if (row.Version != request.Version) return Conflict<ContentCollection>();
        if (request.Grants.Any(x => !Permissions.CmsActions.Contains(x.Permission)) || request.Grants.Distinct().Count() != request.Grants.Length) return Invalid<ContentCollection>();
        var roles = request.Grants.Select(x => x.RoleId).Distinct().ToArray();
        if (await db.Roles.CountAsync(x => roles.Contains(x.Id), ct) != roles.Length) return Invalid<ContentCollection>();
        var oldGrants = await db.Set<ContentGrantRow>().AsNoTracking().Where(x => x.Collection == key).ToArrayAsync(ct);
        var affectedRoles = oldGrants.Select(x => x.RoleId).Concat(roles).Distinct().ToArray();
        var changedRoles = affectedRoles.Where(id => !oldGrants.Where(x => x.RoleId == id).Select(x => x.Permission).Order().SequenceEqual(request.Grants.Where(x => x.RoleId == id).Select(x => x.Permission).Order())).ToArray();
        if (!await roleAccess.CanChangeScopedGrants(changedRoles, ct)) return Denied<ContentCollection>();
        foreach (var permission in oldGrants.Select(x => x.Permission).Concat(request.Grants.Select(x => x.Permission)).Distinct())
            if (!await Can(key, permission, ct)) return Denied<ContentCollection>();
        await db.Set<ContentGrantRow>().Where(x => x.Collection == key).ExecuteDeleteAsync(ct);
        db.AddRange(request.Grants.Select(x => new ContentGrantRow { Collection = key, RoleId = x.RoleId, Permission = x.Permission }));
        await roleAccess.RevokeRoleSessions(changedRoles, ct);
        // Grants use the schema token for optimistic concurrency; preserve a schema snapshot for that token.
        row.Version = Guid.NewGuid(); db.Add(new ContentSchemaRow { Id = row.Version, Collection = key, Fields = row.Fields });
        Audit(row.Version, "cms.grants.saved"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<ContentCollection>.Success(await View(row, ct));
    }
    private static IEnumerable<ContentField> Flatten(ContentField[] fields) => fields.SelectMany(x => new[] { x }.Concat(Flatten(x.Fields ?? [])));
    private static bool ValidFields(ContentField[]? fields, int depth = 0) => fields is { Length: <= 100 } && depth <= 5 &&
        fields.All(x => x is not null) && fields.Select(x => x.Key).Distinct().Count() == fields.Length && fields.All(x =>
            x.Key is not null && Regex.IsMatch(x.Key, "^[a-z][a-zA-Z0-9_]{0,63}$") && !string.IsNullOrWhiteSpace(x.Label) && x.Label.Length <= 120 &&
            x.Type is "text" or "richText" or "number" or "boolean" or "date" or "file" or "image" or "select" or "group" or "reference" &&
            (x.Type != "reference" || !string.IsNullOrWhiteSpace(x.Collection) && !(x.Fields ?? []).Any(f => f.Key is "id" or "item")) &&
            (x.Type != "select" || x.Options is { Length: > 0 } && x.Options.Distinct().Count() == x.Options.Length) &&
            ((x.Fields?.Length ?? 0) == 0 || x.Type is "group" or "reference") && ValidFields(x.Fields ?? [], depth + 1));
    private static bool Compatible(ContentField[] old, ContentField[] fields) => old.All(x => fields.Any(n =>
        n.Key == x.Key && n.Type == x.Type && n.Multiple == x.Multiple && n.Collection == x.Collection &&
        (x.Options ?? []).All(o => (n.Options ?? []).Contains(o)) && Compatible(x.Fields ?? [], n.Fields ?? [])));
    private static bool AddsRequired(ContentField[] old, ContentField[] fields) => fields.Any(n =>
        n.Required && !old.Any(x => x.Key == n.Key && x.Required) || AddsRequired(old.FirstOrDefault(x => x.Key == n.Key)?.Fields ?? [], n.Fields ?? []));
}
