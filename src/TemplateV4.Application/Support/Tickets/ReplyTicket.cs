namespace TemplateV4.Application.Support;

public sealed record ReplyTicket(Guid Id, string Body, bool Internal, Guid Version) : ICommand<Unit>;
public sealed class ReplyTicketValidator : IValidator<ReplyTicket>
{
    public Dictionary<string, string[]> Validate(ReplyTicket q) => string.IsNullOrWhiteSpace(q.Body) || q.Body.Length > 10000 || q.Version == Guid.Empty
        ? new() { ["reply"] = ["validation.failed"] } : [];
}
public sealed class ReplyTicketHandler(ISupportTickets store) : IHandler<ReplyTicket, Unit>
{ public Task<Result<Unit>> Handle(ReplyTicket q, CancellationToken ct) => store.Reply(q, ct); }
