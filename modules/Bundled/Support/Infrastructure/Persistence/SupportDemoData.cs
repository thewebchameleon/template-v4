using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Contact;
using TemplateV4.Infrastructure.Support;

namespace TemplateV4.Infrastructure.Persistence;

public sealed class SupportDemoData(SupportDb db) : IDemoDataContributor
{
    public string ModuleId => "support";
    public int Order => 102;

    public async Task Seed(CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var settings = await db.Set<SupportSettingsRow>().SingleAsync(ct);
        if (!settings.EnquiriesEnabled || !settings.TicketsEnabled)
        {
            settings.EnquiriesEnabled = true;
            settings.TicketsEnabled = true;
            settings.Version = Guid.NewGuid();
        }
        if (!await db.Set<SupportTicketRow>().AnyAsync(x => x.Id == DemoDataIds.Ticket, ct))
        {
            var category = await db.Set<SupportCategoryRow>().FirstOrDefaultAsync(x => x.Active, ct);
            db.Set<SupportTicketRow>().Add(new()
            {
                Id = DemoDataIds.Ticket, RequesterId = DemoDataIds.Participant,
                Subject = "Help with a workspace rollout", Description = "We are preparing the team workspace and would like guidance on the first steps.",
                CategoryId = category?.Id, Priority = "Normal", Status = "Open",
                CreatedAt = now.AddDays(-2), UpdatedAt = now.AddDays(-1)
            });
            db.Set<SupportMessageRow>().Add(new()
            {
                TicketId = DemoDataIds.Ticket, AuthorId = DemoDataIds.Participant,
                Body = "Please point us to the recommended setup sequence.", At = now.AddDays(-1)
            });
        }
        var enquiryId = new Guid("8ad94c4a-58c0-4a86-852f-499bf6329e09");
        if (!await db.Set<ContactRow>().AnyAsync(x => x.Id == enquiryId, ct))
            db.Set<ContactRow>().Add(new()
            {
                Id = enquiryId, Name = "Lebo Mokoena", Email = "lebo@example.invalid",
                Message = "Could your team show us how support and CRM work together?", CreatedAt = now.AddDays(-3)
            });
        await db.SaveChangesAsync(ct);
    }
}
