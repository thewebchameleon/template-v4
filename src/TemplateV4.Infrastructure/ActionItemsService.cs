using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure;

public sealed class ActionItemsService(FrameworkDb db, TimeProvider time) : IActionItems
{
    private IQueryable<Guid> Administrators => from membership in db.UserRoles join role in db.Roles on membership.RoleId equals role.Id where role.Name == "Administrator" select membership.UserId;
    private IQueryable<Guid> Holders(string permission) => from membership in db.UserRoles join claim in db.RoleClaims on membership.RoleId equals claim.RoleId where claim.ClaimType == "permission" && claim.ClaimValue == permission select membership.UserId;
    private IQueryable<Guid> ActiveUsers => from user in db.Users join profile in db.Profiles on user.Id equals profile.Id where !profile.Disabled && user.EmailConfirmed && user.PasswordHash != null && user.RegistrationState != "Pending" && user.RegistrationState != "Rejected" select user.Id;
    // Responsibility (Administrator membership) and authorization are separate checks.
    private async Task<string[]> EligibleQueues(Guid actor, CancellationToken ct) =>
        await Administrators.ContainsAsync(actor, ct) && await Holders(Permissions.Settings).ContainsAsync(actor, ct)
            ? ActionQueues.All.Select(x => x.Id).ToArray() : [];

    public async Task<Result<Page<ActionItemDto>>> List(Guid actor, ActionItemsQuery query, CancellationToken ct)
    {
        if (query.PageNumber is < 1 or > 10000 || query.PageSize is < 1 or > 100 || query.Scope is not ("mine" or "overview") || query.State is not ("Open" or "Completed" or "all") || query.Sort is not ("title" or "source" or "assignee" or "state" or "createdAt") || query.Direction is not ("asc" or "desc") || query.Search is { Length: > 120 })
            return Result<Page<ActionItemDto>>.Fail("validation.failed", ErrorKind.Validation);
        var admin = await Administrators.ContainsAsync(actor, ct);
        var queues = await EligibleQueues(actor, ct);
        var source = db.Set<ActionItemRow>().AsNoTracking().Where(x =>
            query.Scope == "overview" && admin ||
            (x.AssigneeId == actor || x.QueueId != null && queues.Contains(x.QueueId) || query.Scope == "overview" && x.CreatorId == actor));
        if (query.State != "all") source = source.Where(x => x.State == query.State);
        if (!string.IsNullOrWhiteSpace(query.Search)) source = source.Where(x => x.Title.Contains(query.Search));
        var total = await source.CountAsync(ct);
        var descending = query.Direction == "desc";
        var ordered = query.Sort switch
        {
            "title" => descending ? source.OrderByDescending(x => x.Title) : source.OrderBy(x => x.Title),
            "source" => descending ? source.OrderByDescending(x => x.Source) : source.OrderBy(x => x.Source),
            "state" => descending ? source.OrderByDescending(x => x.State) : source.OrderBy(x => x.State),
            "assignee" => descending ? source.OrderByDescending(x => x.QueueId ?? db.Profiles.Where(p => p.Id == x.AssigneeId).Select(p => p.DisplayName).FirstOrDefault()) : source.OrderBy(x => x.QueueId ?? db.Profiles.Where(p => p.Id == x.AssigneeId).Select(p => p.DisplayName).FirstOrDefault()),
            _ => descending ? source.OrderByDescending(x => x.CreatedAt) : source.OrderBy(x => x.CreatedAt)
        };
        var items = await ordered.ThenBy(x => x.Id).Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize)
            .Select(x => new ActionItemDto(x.Id, x.Title, x.Description, x.Source, x.Link, x.AssigneeId, x.QueueId,
                x.QueueId ?? db.Profiles.Where(p => p.Id == x.AssigneeId).Select(p => p.DisplayName).FirstOrDefault() ?? "", x.State, x.CreatedAt, x.CompletedAt,
                x.Source == "Manual" && x.State == "Open" && (x.CreatorId == actor || x.AssigneeId == actor || x.QueueId != null && queues.Contains(x.QueueId))))
            .ToArrayAsync(ct);
        return Result<Page<ActionItemDto>>.Success(new(items, total, query.PageNumber, query.PageSize));
    }

    public async Task<ActionAssignee[]> Assignees(string search, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(search) || search.Length > 120) return [];
        return await db.Profiles.AsNoTracking().Where(x => ActiveUsers.Contains(x.Id) && x.DisplayName.Contains(search.Trim())).OrderBy(x => x.DisplayName).ThenBy(x => x.Id).Take(20).Select(x => new ActionAssignee(x.Id, x.DisplayName)).ToArrayAsync(ct);
    }

    public async Task<Result<Guid>> Create(Guid actor, CreateActionItem request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Trim().Length > 160 || request.Description is null || request.Description.Length > 2000 ||
            !ValidLink(request.Link) || (request.AssigneeId is null) == (request.QueueId is null) || request.QueueId is not null && !ActionQueues.All.Any(x => x.Id == request.QueueId))
            return Result<Guid>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", ct);
        if (!await ActiveUsers.ContainsAsync(actor, ct) || request.AssigneeId is { } assignee && !await ActiveUsers.ContainsAsync(assignee, ct)) return Result<Guid>.Fail("validation.failed", ErrorKind.Validation);
        var row = new ActionItemRow { Title = request.Title.Trim(), Description = request.Description.Trim(), Link = request.Link, CreatorId = actor, AssigneeId = request.AssigneeId, QueueId = request.QueueId, CreatedAt = time.GetUtcNow() };
        db.Add(row);
        await Notify(row, ct);
        db.Audit.Add(new() { ActorId = actor, SubjectId = row.Id, Action = "action_item.created", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<Guid>.Success(row.Id);
    }

    public async Task<Result<Unit>> Complete(Guid actor, Guid id, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", ct);
        var queues = await EligibleQueues(actor, ct);
        if (!await ActiveUsers.ContainsAsync(actor, ct)) return Result.Fail("auth.forbidden", ErrorKind.Forbidden);
        var changed = await db.Set<ActionItemRow>().Where(x => x.Id == id && x.Source == "Manual" && x.State == "Open" && (x.CreatorId == actor || x.AssigneeId == actor || x.QueueId != null && queues.Contains(x.QueueId)))
            .ExecuteUpdateAsync(x => x.SetProperty(a => a.State, "Completed").SetProperty(a => a.CompletedAt, time.GetUtcNow()).SetProperty(a => a.CompletedBy, actor), ct);
        if (changed != 1) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        db.Audit.Add(new() { ActorId = actor, SubjectId = id, Action = "action_item.completed", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }

    // Called inside the owning workflow transaction, so item, notification and source commit together.
    public async Task AddReview(string source, Guid sourceId, Guid subjectId, string title, string link, CancellationToken ct)
    {
        if (await db.Set<ActionItemRow>().AnyAsync(x => x.Source == source && x.SourceId == sourceId, ct)) return;
        var row = new ActionItemRow { Source = source, SourceId = sourceId, SubjectId = subjectId, Title = title, Link = link, QueueId = ActionQueues.ForSource(source), CreatedAt = time.GetUtcNow() };
        db.Add(row); await Notify(row, ct);
    }

    public async Task ResolveReview(string source, Guid sourceId, Guid actor, CancellationToken ct) =>
        await db.Set<ActionItemRow>().Where(x => x.Source == source && x.SourceId == sourceId && x.State == "Open").ExecuteUpdateAsync(x => x.SetProperty(a => a.State, "Completed").SetProperty(a => a.CompletedAt, time.GetUtcNow()).SetProperty(a => a.CompletedBy, actor), ct);

    private async Task Notify(ActionItemRow row, CancellationToken ct)
    {
        var recipients = ActiveUsers.Where(x => row.AssigneeId == x || row.QueueId != null && Administrators.Contains(x) && Holders(Permissions.Settings).Contains(x));
        foreach (var id in await recipients.Distinct().ToArrayAsync(ct)) db.Notifications.Add(new() { UserId = id, Kind = "notificationActionAssigned", Link = "/action-items", CreatedAt = time.GetUtcNow() });
    }

    private static bool ValidLink(string? link) => link is { Length: > 1 and <= 1000 } && link.StartsWith('/') && !link.StartsWith("//", StringComparison.Ordinal) && !link.Any(c => char.IsControl(c) || char.IsWhiteSpace(c) || c is '\\' or '%') && !link.StartsWith("/api", StringComparison.OrdinalIgnoreCase) && Uri.TryCreate(new Uri("https://application.invalid"), link, out var uri) && uri.Host == "application.invalid";
}
