using TemplateV4.Application.Users;

namespace TemplateV4.Application.Support;

public interface ISupportTickets
{
    Task<Result<Page<TicketItem>>> List(ListTickets query, CancellationToken ct);
    Task<Result<TicketDetail>> Get(GetTicket query, CancellationToken ct);
    Task<Result<Guid>> Create(CreateTicket command, CancellationToken ct);
    Task<Result<Unit>> Reply(ReplyTicket command, CancellationToken ct);
    Task<Result<Unit>> Update(UpdateTicket command, CancellationToken ct);
}
