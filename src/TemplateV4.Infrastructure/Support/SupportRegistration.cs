using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.FileStorage;
using TemplateV4.Application.Support;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Support;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddSupport(IServiceCollection services)
    {
        services.AddScoped<TemplateV4.Application.Dashboards.IDashboardCardProvider, SupportDashboardCards>();
        services.AddScoped<TemplateV4.Application.Contact.IContact, Contact.ContactStore>();
        services.AddScoped<SupportTicketContext>();
        services.AddScoped<ISupportTickets, SupportTicketStore>();
        services.AddScoped<ISupportCategories, SupportCategoriesStore>();
        services.AddScoped<ISupportAttachments, SupportAttachmentsStore>();
        services.AddScoped<IStorageUsageSource, SupportAttachmentStorageUsage>();
        services.AddScoped<ISupportModuleSettings, SupportModuleSettingsStore>();
        services.AddScoped<TemplateV4.Application.Modules.ICapabilityRestrictions, SupportCapabilityRestrictions>();
        services.AddScoped<IHandler<SaveSupportModuleSettings, SupportModuleSettings>, SaveSupportModuleSettingsHandler>();
        services.AddSingleton<IValidator<SaveSupportModuleSettings>, SaveSupportModuleSettingsValidator>();
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
