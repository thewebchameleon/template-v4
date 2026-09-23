using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Support;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Support;

public sealed partial class SupportTicketStore
{
    public async Task<Result<Page<TicketItem>>> List(ListTickets q, CancellationToken ct)
    {
        if (!await tickets.Available(ct)) return Result<Page<TicketItem>>.Fail("support.not_found", ErrorKind.NotFound);
        var agent = await tickets.Agent(ct);
        if (q.Queue && !agent) return Result<Page<TicketItem>>.Fail("authorization.denied", ErrorKind.Forbidden);
        var reference = q.Search.StartsWith("TK-", StringComparison.OrdinalIgnoreCase) && long.TryParse(q.Search.AsSpan(3), out var number) ? number : -1;
        var source = tickets.Visible(q.Queue && agent).AsNoTracking().Where(x => x.Subject.Contains(q.Search) || x.Description.Contains(q.Search) || x.ReferenceNumber == reference);
        if (q.Queue) source = source.Where(x => x.Status != "Draft");
        if (q.Status != "") source = source.Where(x => x.Status == q.Status);
        if (q.Priority != "") source = source.Where(x => x.Status != "Draft" && x.Priority == q.Priority);
        if (Guid.TryParse(q.Category, out var category)) source = source.Where(x => x.CategoryId == category);
        if (q.Assignee == "unassigned") source = source.Where(x => x.Status != "Draft" && x.AssigneeId == null);
        else if (Guid.TryParse(q.Assignee, out var assignee)) source = source.Where(x => x.AssigneeId == assignee);
        var total = await source.CountAsync(ct); var items = source; var desc = q.Direction == "desc";
        var ordered = q.Sort switch
        {
            "referenceNumber" => desc ? items.OrderByDescending(x => x.ReferenceNumber) : items.OrderBy(x => x.ReferenceNumber),
            "subject" => desc ? items.OrderByDescending(x => x.Subject) : items.OrderBy(x => x.Subject),
            "requester" => desc ? items.OrderByDescending(x => db.Profiles.Where(p => p.Id == x.RequesterId).Select(p => p.DisplayName).FirstOrDefault()) : items.OrderBy(x => db.Profiles.Where(p => p.Id == x.RequesterId).Select(p => p.DisplayName).FirstOrDefault()),
            "category" => desc ? items.OrderByDescending(x => db.Set<SupportCategoryRow>().Where(c => c.Id == x.CategoryId).Select(c => c.Name).FirstOrDefault()) : items.OrderBy(x => db.Set<SupportCategoryRow>().Where(c => c.Id == x.CategoryId).Select(c => c.Name).FirstOrDefault()),
            "status" => desc ? items.OrderByDescending(x => x.Status) : items.OrderBy(x => x.Status),
            "priority" => desc ? items.OrderByDescending(x => x.Priority == "Critical" ? 3 : x.Priority == "High" ? 2 : x.Priority == "Normal" ? 1 : 0) : items.OrderBy(x => x.Priority == "Critical" ? 3 : x.Priority == "High" ? 2 : x.Priority == "Normal" ? 1 : 0),
            "assignee" => desc ? items.OrderByDescending(x => db.Profiles.Where(p => p.Id == x.AssigneeId).Select(p => p.DisplayName).FirstOrDefault()) : items.OrderBy(x => db.Profiles.Where(p => p.Id == x.AssigneeId).Select(p => p.DisplayName).FirstOrDefault()),
            "createdAt" => desc ? items.OrderByDescending(x => x.CreatedAt) : items.OrderBy(x => x.CreatedAt),
            _ => desc ? items.OrderByDescending(x => x.UpdatedAt) : items.OrderBy(x => x.UpdatedAt)
        };
        return Result<Page<TicketItem>>.Success(new(await tickets.Items(ordered.ThenBy(x => x.Id).Skip((q.PageNumber - 1) * q.PageSize).Take(q.PageSize)).ToArrayAsync(ct), total, q.PageNumber, q.PageSize));
    }
}
