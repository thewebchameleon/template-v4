using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.FileStorage;
using TemplateV4.Application.Support;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Support;

public sealed class SupportAttachmentStorageUsage(SupportDb db) : IStorageUsageSource
{
    public Task<long> Read(CancellationToken ct) => db.Set<SupportAttachmentRow>().SumAsync(x => (long)x.Content.Length, ct);
}

public sealed class SupportAttachmentsStore(SupportDb db, SupportTicketContext tickets, IExecutionContext context, TimeProvider time,
    TemplateV4.Application.FileStorage.IStorageQuota storageQuota) : ISupportAttachments
{
    public async Task<Result<Unit>> Attach(AttachTicket q, CancellationToken ct)
    {
        if (!await tickets.Available(ct)) return Result.Fail("support.not_found", ErrorKind.NotFound);
        var ticket = await tickets.Lock(q.Id, await tickets.Agent(ct), ct);
        if (ticket == null) return Result.Fail("support.not_found", ErrorKind.NotFound);
        if (ticket.Version != q.Version) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (ticket.Status is "Closed" or "Resolved") return Result.Fail("support.reopen_required", ErrorKind.Conflict);
        var files = db.Set<SupportAttachmentRow>().Where(x => x.TicketId == q.Id);
        if (await files.CountAsync(ct) >= 10 || await files.SumAsync(x => (long)x.Content.Length, ct) + q.Content.Length > 20 * 1024 * 1024)
            return Result.Fail("support.attachment_limit", ErrorKind.Conflict);
        if (!await storageQuota.Fits(0, q.Content.LongLength, ct)) return Result.Fail("files.quota", ErrorKind.Conflict);
        db.Add(new SupportAttachmentRow { TicketId = q.Id, OwnerId = context.ActorId!.Value, Name = q.Name.Trim(), Content = q.Content, At = time.GetUtcNow() });
        tickets.Touch(ticket); tickets.History(ticket, "attachment"); tickets.Audit(ticket, "attachment_added");
        await tickets.Notify(ticket.RequesterId == context.ActorId ? ticket.AssigneeId : ticket.RequesterId, ticket.Id, ct);
        return Result.Success();
    }
    public async Task<Result<TicketDownload>> Download(Guid id, Guid attachmentId, CancellationToken ct)
    {
        if (!await tickets.Available(ct) || !await tickets.Visible(await tickets.Agent(ct)).AnyAsync(x => x.Id == id, ct)) return Result<TicketDownload>.Fail("support.not_found", ErrorKind.NotFound);
        var file = await db.Set<SupportAttachmentRow>().AsNoTracking().Where(x => x.Id == attachmentId && x.TicketId == id).Select(x => new TicketDownload(x.Name, x.Content)).SingleOrDefaultAsync(ct);
        return file == null ? Result<TicketDownload>.Fail("support.not_found", ErrorKind.NotFound) : Result<TicketDownload>.Success(file);
    }
}
