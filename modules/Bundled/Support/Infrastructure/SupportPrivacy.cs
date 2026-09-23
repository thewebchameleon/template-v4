using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Privacy;
using TemplateV4.Infrastructure.Persistence;
namespace TemplateV4.Infrastructure.Support;
public sealed class SupportPrivacy(SupportDb db) : IPrivacyContributor
{
    public async Task<IReadOnlyDictionary<string, object?>> Export(Guid actor, CancellationToken ct)
    {
        var supportTickets = await db.Set<SupportTicketRow>().AsNoTracking().Where(x => x.RequesterId == actor).ToArrayAsync(ct);
        var ticketIds = supportTickets.Select(x => x.Id).ToArray();
        var supportMessages = await db.Set<SupportMessageRow>().AsNoTracking().Where(x => ticketIds.Contains(x.TicketId) && !x.Internal).ToArrayAsync(ct);
        var supportAttachments = await db.Set<SupportAttachmentRow>().AsNoTracking().Where(x => ticketIds.Contains(x.TicketId)).Select(x => new { x.Id, x.TicketId, x.Name, Size = x.Content.Length, x.At }).ToArrayAsync(ct);

        return new Dictionary<string, object?> { ["supportTickets"] = supportTickets, ["supportMessages"] = supportMessages, ["supportAttachments"] = supportAttachments };
    }
    public async Task Erase(Guid actor, CancellationToken ct)
    {
            // Erasure runs even when Support is disabled. Remove requester conversations and files,
            // and erase contributions to other requesters' tickets without retaining content in audit.
            await db.Set<SupportTicketRow>().Where(x => x.RequesterId == actor).ExecuteDeleteAsync(ct);
            await db.Set<SupportMessageRow>().Where(x => x.AuthorId == actor).ExecuteDeleteAsync(ct);
            await db.Set<SupportAttachmentRow>().Where(x => x.OwnerId == actor).ExecuteDeleteAsync(ct);
            await db.Set<SupportTicketRow>().Where(x => x.AssigneeId == actor).ExecuteUpdateAsync(x => x.SetProperty(t => t.AssigneeId, (Guid?)null).SetProperty(t => t.Version, Guid.NewGuid()), ct);

    }
}
