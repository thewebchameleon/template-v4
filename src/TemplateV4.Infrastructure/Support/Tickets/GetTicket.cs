using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Support;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Support;

public sealed partial class SupportTicketStore
{
    public async Task<Result<TicketDetail>> Get(GetTicket q, CancellationToken ct)
    {
        if (!await Available(ct)) return Result<TicketDetail>.Fail("support.not_found", ErrorKind.NotFound);
        if (q.PageNumber is < 1 or > 10000) return Result<TicketDetail>.Fail("query.invalid", ErrorKind.Validation);
        var agent = await Agent(ct); var visible = Visible(agent).AsNoTracking().Where(x => x.Id == q.Id);
        var item = await Items(visible).SingleOrDefaultAsync(ct);
        if (item == null) return Result<TicketDetail>.Fail("support.not_found", ErrorKind.NotFound);
        var messages = db.Set<SupportMessageRow>().AsNoTracking().Where(x => x.TicketId == q.Id && (agent || !x.Internal));
        var count = await messages.CountAsync(ct);
        var page = await messages.OrderByDescending(x => x.At).ThenBy(x => x.Id).Skip((q.PageNumber - 1) * 25).Take(25)
            .Select(x => new TicketMessage(x.Id, x.AuthorId, db.Profiles.Where(p => p.Id == x.AuthorId).Select(p => p.DisplayName).FirstOrDefault(), x.Body, x.Internal, x.Kind, x.At)).ToArrayAsync(ct);
        var assignedIds = page.Where(x => x.Kind == "assignment" && Guid.TryParse(x.Body, out _)).Select(x => Guid.Parse(x.Body)).ToArray();
        var names = await db.Profiles.AsNoTracking().Where(x => assignedIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.DisplayName, ct);
        page = page.Select(x => x.Kind == "assignment" ? x with { Body = Guid.TryParse(x.Body, out var assigned) ? names.GetValueOrDefault(assigned) ?? "" : "" } : x).ToArray();
        var attachments = await db.Set<SupportAttachmentRow>().AsNoTracking().Where(x => x.TicketId == q.Id).OrderBy(x => x.At)
            .Select(x => new TicketAttachment(x.Id, x.Name, x.Content.Length, x.At)).ToArrayAsync(ct);
        return Result<TicketDetail>.Success(new(item, await visible.Select(x => x.Description).SingleAsync(ct), new(page, count, q.PageNumber, 25), attachments, agent));
    }
}
