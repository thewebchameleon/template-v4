using TemplateV4.Application.Users;
using TemplateV4.Domain.Support;

namespace TemplateV4.Application.Support;

public sealed record TicketItem(Guid Id, long ReferenceNumber, string Subject, string Description, Guid RequesterId, string Requester, Guid? CategoryId, string? Category,
    string Status, string Priority, Guid? AssigneeId, string? Assignee, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt, Guid Version);
public sealed record ListTickets(int PageNumber = 1, int PageSize = 10, string Search = "", string Status = "", string Priority = "",
    string Category = "", string Assignee = "", bool Queue = false, string Sort = "updatedAt", string Direction = "desc") : IQuery<Page<TicketItem>>;
public sealed class ListTicketsValidator : IValidator<ListTickets>
{
    public Dictionary<string, string[]> Validate(ListTickets q) => q.PageNumber is < 1 or > 10000 || q.PageSize is < 1 or > 100 || q.Search is null or { Length: > 200 } ||
        q.Status != "" && !TicketWorkflow.States.Contains(q.Status) || q.Priority != "" && !TicketWorkflow.Priorities.Contains(q.Priority) ||
        q.Category != "" && !Guid.TryParse(q.Category, out _) || q.Assignee is not ("" or "unassigned") && !Guid.TryParse(q.Assignee, out _) ||
        q.Sort is not ("referenceNumber" or "subject" or "requester" or "category" or "status" or "priority" or "assignee" or "createdAt" or "updatedAt") || q.Direction is not ("asc" or "desc")
        ? new() { ["query"] = ["query.invalid"] } : [];
}
public sealed class ListTicketsHandler(ISupportTickets store) : IHandler<ListTickets, Page<TicketItem>>
{ public Task<Result<Page<TicketItem>>> Handle(ListTickets q, CancellationToken ct) => store.List(q, ct); }
