using TemplateV4.Application.Users;

namespace TemplateV4.Application.Support;

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
