using TemplateV4.Application.Support;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Support;

public sealed partial class SupportTicketStore(SupportDb db, IExecutionContext context, TimeProvider time,
    SupportTicketContext tickets) : ISupportTickets;
