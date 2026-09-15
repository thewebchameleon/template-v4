using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Support;
using TemplateV4.Domain.Support;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Support;

public sealed partial class SupportTicketStore
{
    public async Task<Result<Unit>> Update(UpdateTicket q, CancellationToken ct)
    {
        if (!await Available(ct)) return Result.Fail("support.not_found", ErrorKind.NotFound);
        var agent = await Agent(ct); var ticket = await Lock(q.Id, agent, ct);
        if (ticket == null) return Result.Fail("support.not_found", ErrorKind.NotFound);
        if (ticket.Version != q.Version) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (!TicketWorkflow.CanTransition(ticket.Status, q.Status, agent) || !agent && (q.Priority != ticket.Priority || q.CategoryId != ticket.CategoryId || q.AssigneeId != ticket.AssigneeId))
            return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        if (q.CategoryId != ticket.CategoryId && !await db.Set<SupportCategoryRow>().AnyAsync(x => x.Id == q.CategoryId && x.Active, ct)) return Result.Fail("support.category_invalid", ErrorKind.Validation);
        if (q.AssigneeId != null && q.AssigneeId != ticket.AssigneeId && !await Agents().ContainsAsync(q.AssigneeId.Value, ct)) return Result.Fail("support.assignee_invalid", ErrorKind.Validation);
        if (ticket.Status != q.Status) { History(ticket, "status", q.Status); await Notify(ticket.RequesterId == context.ActorId ? ticket.AssigneeId : ticket.RequesterId, ticket.Id, ct); }
        if (ticket.AssigneeId != q.AssigneeId) { History(ticket, "assignment", q.AssigneeId?.ToString() ?? "", internalNote: true); await Notify(q.AssigneeId, ticket.Id, ct); }
        if (ticket.Priority != q.Priority) History(ticket, "priority", q.Priority);
        if (ticket.CategoryId != q.CategoryId) History(ticket, "category");
        ticket.Status = q.Status; ticket.Priority = q.Priority; ticket.CategoryId = q.CategoryId; ticket.AssigneeId = q.AssigneeId;
        Touch(ticket); Audit(ticket, "updated"); return Result.Success();
    }
}
