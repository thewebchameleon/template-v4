namespace TemplateV4.Application.Support;

public sealed record CreateTicket(string Subject, string Description, Guid CategoryId) : ICommand<Guid>;
public sealed class CreateTicketValidator : IValidator<CreateTicket>
{
    public Dictionary<string, string[]> Validate(CreateTicket q) => string.IsNullOrWhiteSpace(q.Subject) || q.Subject.Length > 180 ||
        string.IsNullOrWhiteSpace(q.Description) || q.Description.Length > 10000 || q.CategoryId == Guid.Empty
        ? new() { ["ticket"] = ["validation.failed"] } : [];
}
public sealed class CreateTicketHandler(ISupportTickets store) : IHandler<CreateTicket, Guid>
{ public Task<Result<Guid>> Handle(CreateTicket q, CancellationToken ct) => store.Create(q, ct); }
