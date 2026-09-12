using TemplateV4.Application.Users;
using TemplateV4.Domain.Support;

namespace TemplateV4.Application.Support;

public sealed record SupportCategory(Guid Id, string Name, bool Active, Guid Version);
public sealed record SupportAgent(Guid Id, string Name);
public sealed record SupportOptions(SupportCategory[] Categories, SupportAgent[] Agents, bool Agent, bool Administrator);
public sealed record TicketItem(Guid Id, string Subject, Guid RequesterId, string Requester, Guid CategoryId, string Category,
    string Status, string Priority, Guid? AssigneeId, string? Assignee, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt, Guid Version);
public sealed record TicketMessage(Guid Id, Guid? AuthorId, string? Author, string Body, bool Internal, string Kind, DateTimeOffset At);
public sealed record TicketAttachment(Guid Id, string Name, int Size, DateTimeOffset At);
public sealed record TicketDetail(TicketItem Ticket, string Description, Page<TicketMessage> Messages, TicketAttachment[] Attachments, bool Agent);
public sealed record TicketDownload(string Name, byte[] Content);
public sealed record ListTickets(int PageNumber = 1, int PageSize = 10, string Search = "", string Status = "", string Priority = "",
    string Category = "", string Assignee = "", bool Queue = false, string Sort = "updatedAt", string Direction = "desc") : IQuery<Page<TicketItem>>;
public sealed record GetTicket(Guid Id, int PageNumber = 1) : IQuery<TicketDetail>;
public sealed record CreateTicket(string Subject, string Description, Guid CategoryId) : ICommand<Guid>;
public sealed record ReplyTicket(Guid Id, string Body, bool Internal, Guid Version) : ICommand<Unit>;
public sealed record UpdateTicket(Guid Id, string Status, string Priority, Guid CategoryId, Guid? AssigneeId, Guid Version) : ICommand<Unit>;
public sealed record SaveSupportCategory(Guid? Id, string Name, bool Active, Guid Version) : ICommand<Unit>, IAuthorizedRequest
{ public string Permission => Permissions.SupportAdmin; }
public sealed record AttachTicket(Guid Id, string Name, byte[] Content, Guid Version) : ICommand<Unit>;

public interface ISupportTickets
{
    Task<Result<Page<TicketItem>>> List(ListTickets query, CancellationToken ct);
    Task<Result<TicketDetail>> Get(GetTicket query, CancellationToken ct);
    Task<Result<SupportOptions>> Options(string search, CancellationToken ct);
    Task<Result<Guid>> Create(CreateTicket command, CancellationToken ct);
    Task<Result<Unit>> Reply(ReplyTicket command, CancellationToken ct);
    Task<Result<Unit>> Update(UpdateTicket command, CancellationToken ct);
    Task<Result<Unit>> Category(SaveSupportCategory command, CancellationToken ct);
    Task<Result<Unit>> Attach(AttachTicket command, CancellationToken ct);
    Task<Result<TicketDownload>> Download(Guid id, Guid attachmentId, CancellationToken ct);
}

public sealed class ListTicketsValidator : IValidator<ListTickets>
{
    public Dictionary<string, string[]> Validate(ListTickets q) => q.PageNumber is < 1 or > 10000 || q.PageSize is < 1 or > 100 || q.Search is null or { Length: > 200 } ||
        q.Status != "" && !TicketWorkflow.States.Contains(q.Status) || q.Priority != "" && !TicketWorkflow.Priorities.Contains(q.Priority) ||
        q.Category != "" && !Guid.TryParse(q.Category, out _) || q.Assignee is not ("" or "unassigned") && !Guid.TryParse(q.Assignee, out _) ||
        q.Sort is not ("subject" or "requester" or "category" or "status" or "priority" or "assignee" or "createdAt" or "updatedAt") || q.Direction is not ("asc" or "desc")
        ? new() { ["query"] = ["query.invalid"] } : [];
}
public sealed class CreateTicketValidator : IValidator<CreateTicket>
{
    public Dictionary<string, string[]> Validate(CreateTicket q) => string.IsNullOrWhiteSpace(q.Subject) || q.Subject.Length > 180 ||
        string.IsNullOrWhiteSpace(q.Description) || q.Description.Length > 10000 || q.CategoryId == Guid.Empty
        ? new() { ["ticket"] = ["validation.failed"] } : [];
}
public sealed class ReplyTicketValidator : IValidator<ReplyTicket>
{
    public Dictionary<string, string[]> Validate(ReplyTicket q) => string.IsNullOrWhiteSpace(q.Body) || q.Body.Length > 10000 || q.Version == Guid.Empty
        ? new() { ["reply"] = ["validation.failed"] } : [];
}
public sealed class UpdateTicketValidator : IValidator<UpdateTicket>
{
    public Dictionary<string, string[]> Validate(UpdateTicket q) => !TicketWorkflow.States.Contains(q.Status) || !TicketWorkflow.Priorities.Contains(q.Priority) || q.CategoryId == Guid.Empty || q.Version == Guid.Empty
        ? new() { ["ticket"] = ["validation.failed"] } : [];
}
public sealed class SaveSupportCategoryValidator : IValidator<SaveSupportCategory>
{
    public Dictionary<string, string[]> Validate(SaveSupportCategory q) => string.IsNullOrWhiteSpace(q.Name) || q.Name.Length > 80 || q.Id != null && q.Version == Guid.Empty
        ? new() { ["category"] = ["validation.failed"] } : [];
}
public sealed class AttachTicketValidator : IValidator<AttachTicket>
{
    public Dictionary<string, string[]> Validate(AttachTicket q) => string.IsNullOrWhiteSpace(q.Name) || q.Name.Length > 180 || q.Name.Any(c => char.IsControl(c) || c is '/' or '\\') ||
        q.Content is null or { Length: 0 } or { Length: > 5242880 } || q.Version == Guid.Empty
        ? new() { ["attachment"] = ["validation.failed"] } : [];
}
public sealed class ListTicketsHandler(ISupportTickets store) : IHandler<ListTickets, Page<TicketItem>>
{ public Task<Result<Page<TicketItem>>> Handle(ListTickets q, CancellationToken ct) => store.List(q, ct); }
public sealed class GetTicketHandler(ISupportTickets store) : IHandler<GetTicket, TicketDetail>
{ public Task<Result<TicketDetail>> Handle(GetTicket q, CancellationToken ct) => store.Get(q, ct); }
public sealed class CreateTicketHandler(ISupportTickets store) : IHandler<CreateTicket, Guid>
{ public Task<Result<Guid>> Handle(CreateTicket q, CancellationToken ct) => store.Create(q, ct); }
public sealed class ReplyTicketHandler(ISupportTickets store) : IHandler<ReplyTicket, Unit>
{ public Task<Result<Unit>> Handle(ReplyTicket q, CancellationToken ct) => store.Reply(q, ct); }
public sealed class UpdateTicketHandler(ISupportTickets store) : IHandler<UpdateTicket, Unit>
{ public Task<Result<Unit>> Handle(UpdateTicket q, CancellationToken ct) => store.Update(q, ct); }
public sealed class SaveSupportCategoryHandler(ISupportTickets store) : IHandler<SaveSupportCategory, Unit>
{ public Task<Result<Unit>> Handle(SaveSupportCategory q, CancellationToken ct) => store.Category(q, ct); }
public sealed class AttachTicketHandler(ISupportTickets store) : IHandler<AttachTicket, Unit>
{ public Task<Result<Unit>> Handle(AttachTicket q, CancellationToken ct) => store.Attach(q, ct); }
