using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure;

public sealed partial class ActionItemsService
{

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
}
