using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Support;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Support;

public sealed partial class SupportTicketStore
{
    public async Task<Result<Unit>> Attach(AttachTicket q, CancellationToken ct)
    {
        if (!await Available(ct)) return Result.Fail("support.not_found", ErrorKind.NotFound);
        var ticket = await Lock(q.Id, await Agent(ct), ct);
        if (ticket == null) return Result.Fail("support.not_found", ErrorKind.NotFound);
        if (ticket.Version != q.Version) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (ticket.Status is "Closed" or "Resolved") return Result.Fail("support.reopen_required", ErrorKind.Conflict);
        var files = db.Set<SupportAttachmentRow>().Where(x => x.TicketId == q.Id);
        if (await files.CountAsync(ct) >= 10 || await files.SumAsync(x => (long)x.Content.Length, ct) + q.Content.Length > 20 * 1024 * 1024)
            return Result.Fail("support.attachment_limit", ErrorKind.Conflict);
        db.Add(new SupportAttachmentRow { TicketId = q.Id, OwnerId = context.ActorId!.Value, Name = q.Name.Trim(), Content = q.Content, At = time.GetUtcNow() });
        Touch(ticket); History(ticket, "attachment"); Audit(ticket, "attachment_added");
        await Notify(ticket.RequesterId == context.ActorId ? ticket.AssigneeId : ticket.RequesterId, ticket.Id, ct);
        return Result.Success();
    }
    public async Task<Result<TicketDownload>> Download(Guid id, Guid attachmentId, CancellationToken ct)
    {
        if (!await Available(ct) || !await Visible(await Agent(ct)).AnyAsync(x => x.Id == id, ct)) return Result<TicketDownload>.Fail("support.not_found", ErrorKind.NotFound);
        var file = await db.Set<SupportAttachmentRow>().AsNoTracking().Where(x => x.Id == attachmentId && x.TicketId == id).Select(x => new TicketDownload(x.Name, x.Content)).SingleOrDefaultAsync(ct);
        return file == null ? Result<TicketDownload>.Fail("support.not_found", ErrorKind.NotFound) : Result<TicketDownload>.Success(file);
    }
}
