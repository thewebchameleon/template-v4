using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Support;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Support;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddSupport(IServiceCollection services)
    {
        services.AddScoped<ISupportTickets, SupportTicketStore>();
        services.AddScoped<IHandler<ListTickets, Page<TicketItem>>, ListTicketsHandler>();
        services.AddSingleton<IValidator<ListTickets>, ListTicketsValidator>();
        services.AddScoped<IHandler<GetTicket, TicketDetail>, GetTicketHandler>();
        services.AddScoped<IHandler<CreateTicket, Guid>, CreateTicketHandler>();
        services.AddSingleton<IValidator<CreateTicket>, CreateTicketValidator>();
        services.AddScoped<IHandler<ReplyTicket, Unit>, ReplyTicketHandler>();
        services.AddSingleton<IValidator<ReplyTicket>, ReplyTicketValidator>();
        services.AddScoped<IHandler<UpdateTicket, Unit>, UpdateTicketHandler>();
        services.AddSingleton<IValidator<UpdateTicket>, UpdateTicketValidator>();
        services.AddScoped<IHandler<SaveSupportCategory, Unit>, SaveSupportCategoryHandler>();
        services.AddSingleton<IValidator<SaveSupportCategory>, SaveSupportCategoryValidator>();
        services.AddScoped<IHandler<AttachTicket, Unit>, AttachTicketHandler>();
        services.AddSingleton<IValidator<AttachTicket>, AttachTicketValidator>();
    }
}
