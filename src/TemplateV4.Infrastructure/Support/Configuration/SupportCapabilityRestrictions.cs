using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Support;

public sealed class SupportCapabilityRestrictions(FrameworkDb db) : ICapabilityRestrictions
{
    public async Task<IReadOnlyDictionary<string, bool>> Read(CancellationToken ct)
    {
        var settings = await db.Set<SupportSettingsRow>().AsNoTracking().SingleOrDefaultAsync(ct);
        return new Dictionary<string, bool>
        {
            [CapabilityIds.SupportEnquiries] = settings?.EnquiriesEnabled == true && !string.IsNullOrWhiteSpace(settings.NotificationEmail),
            [CapabilityIds.SupportTickets] = settings?.TicketsEnabled == true
        };
    }
}
