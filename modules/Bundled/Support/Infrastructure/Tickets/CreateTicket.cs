using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Support;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Support;

public sealed partial class SupportTicketStore
{
    public async Task<Result<Guid>> Create(CreateTicket q, CancellationToken ct)
    {
        if (!await tickets.Available(ct)) return Result<Guid>.Fail("support.not_found", ErrorKind.NotFound);
        if (q.CategoryId is { } category && !await db.Set<SupportCategoryRow>().AnyAsync(x => x.Id == category && x.Active, ct)) return Result<Guid>.Fail("support.category_invalid", ErrorKind.Validation);
        var ticket = new SupportTicketRow { RequesterId = context.ActorId!.Value, Subject = q.Subject.Trim(), Description = q.Description.Trim(), CategoryId = q.CategoryId, Status = q.Draft ? "Draft" : "Open", CreatedAt = time.GetUtcNow(), UpdatedAt = time.GetUtcNow() };
        db.Add(ticket); tickets.Audit(ticket, q.Draft ? "draft_saved" : "created");
        return Result<Guid>.Success(ticket.Id);
    }
}
