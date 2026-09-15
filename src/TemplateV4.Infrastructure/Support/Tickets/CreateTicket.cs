using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Support;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Support;

public sealed partial class SupportTicketStore
{
    public async Task<Result<Guid>> Create(CreateTicket q, CancellationToken ct)
    {
        if (!await Available(ct)) return Result<Guid>.Fail("support.not_found", ErrorKind.NotFound);
        if (!await db.Set<SupportCategoryRow>().AnyAsync(x => x.Id == q.CategoryId && x.Active, ct)) return Result<Guid>.Fail("support.category_invalid", ErrorKind.Validation);
        var ticket = new SupportTicketRow { RequesterId = context.ActorId!.Value, Subject = q.Subject.Trim(), Description = q.Description.Trim(), CategoryId = q.CategoryId, CreatedAt = time.GetUtcNow(), UpdatedAt = time.GetUtcNow() };
        db.Add(ticket); Audit(ticket, "created");
        return Result<Guid>.Success(ticket.Id);
    }
}
