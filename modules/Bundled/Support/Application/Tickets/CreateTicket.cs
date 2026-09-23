namespace TemplateV4.Application.Support;

public sealed record CreateTicket(string Subject, string Description, Guid? CategoryId, bool Draft = false) : ICommand<Guid>;
public sealed class CreateTicketValidator : IValidator<CreateTicket>
{
    public Dictionary<string, string[]> Validate(CreateTicket q) => q.Subject is null or { Length: > 180 } || q.Description is null or { Length: > 10000 } || q.CategoryId == Guid.Empty ||
        !q.Draft && (string.IsNullOrWhiteSpace(q.Subject) || string.IsNullOrWhiteSpace(q.Description) || q.CategoryId == null)
        ? new() { ["ticket"] = ["validation.failed"] } : [];
}
public sealed class CreateTicketHandler(ISupportTickets store) : IHandler<CreateTicket, Guid>
{ public Task<Result<Guid>> Handle(CreateTicket q, CancellationToken ct) => store.Create(q, ct); }
