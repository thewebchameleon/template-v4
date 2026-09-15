using TemplateV4.Application.Users;

namespace TemplateV4.Application.Support;

public sealed record TicketMessage(Guid Id, Guid? AuthorId, string? Author, string Body, bool Internal, string Kind, DateTimeOffset At);
public sealed record TicketAttachment(Guid Id, string Name, int Size, DateTimeOffset At);
public sealed record TicketDetail(TicketItem Ticket, string Description, Page<TicketMessage> Messages, TicketAttachment[] Attachments, bool Agent);
public sealed record GetTicket(Guid Id, int PageNumber = 1) : IQuery<TicketDetail>;
public sealed class GetTicketHandler(ISupportTickets store) : IHandler<GetTicket, TicketDetail>
{ public Task<Result<TicketDetail>> Handle(GetTicket q, CancellationToken ct) => store.Get(q, ct); }
