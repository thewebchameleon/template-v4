using TemplateV4.Domain.Support;

namespace TemplateV4.Application.Support;

public sealed record UpdateTicket(Guid Id, string Status, string Priority, Guid? CategoryId, Guid? AssigneeId, Guid Version,
    string? Subject = null, string? Description = null) : ICommand<Unit>;
public sealed class UpdateTicketValidator : IValidator<UpdateTicket>
{
    public Dictionary<string, string[]> Validate(UpdateTicket q) => !TicketWorkflow.States.Contains(q.Status) || !TicketWorkflow.Priorities.Contains(q.Priority) ||
        q.CategoryId == Guid.Empty || q.Version == Guid.Empty || q.Subject is { Length: > 180 } || q.Description is { Length: > 10000 }
        ? new() { ["ticket"] = ["validation.failed"] } : [];
}
public sealed class UpdateTicketHandler(ISupportTickets store) : IHandler<UpdateTicket, Unit>
{ public Task<Result<Unit>> Handle(UpdateTicket q, CancellationToken ct) => store.Update(q, ct); }
