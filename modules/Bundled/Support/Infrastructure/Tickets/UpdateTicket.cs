using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Support;
using TemplateV4.Domain.Support;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Support;

public sealed partial class SupportTicketStore
{
    public async Task<Result<Unit>> Update(UpdateTicket q, CancellationToken ct)
    {
        if (!await tickets.Available(ct)) return Result.Fail("support.not_found", ErrorKind.NotFound);
        var agent = await tickets.Agent(ct); var ticket = await tickets.Lock(q.Id, agent, ct);
        if (ticket == null) return Result.Fail("support.not_found", ErrorKind.NotFound);
        if (ticket.Version != q.Version) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (ticket.Status == "Draft")
        {
            if (ticket.RequesterId != context.ActorId || q.Status is not ("Draft" or "Open") || q.Priority != ticket.Priority || q.AssigneeId != null)
                return Result.Fail("authorization.denied", ErrorKind.Forbidden);
            var subject = (q.Subject ?? ticket.Subject).Trim();
            var description = (q.Description ?? ticket.Description).Trim();
            if (q.Status == "Open" && (subject == "" || description == "" || q.CategoryId == null))
                return Result.Fail("validation.failed", ErrorKind.Validation);
            if (q.CategoryId is { } draftCategory && (q.Status == "Open" || q.CategoryId != ticket.CategoryId) &&
                !await db.Set<SupportCategoryRow>().AnyAsync(x => x.Id == draftCategory && x.Active, ct))
                return Result.Fail("support.category_invalid", ErrorKind.Validation);
            ticket.Subject = subject; ticket.Description = description; ticket.CategoryId = q.CategoryId;
            if (q.Status == "Open") { ticket.Status = "Open"; tickets.History(ticket, "status", "Open"); }
            tickets.Touch(ticket); tickets.Audit(ticket, q.Status == "Open" ? "created" : "draft_saved");
            return Result.Success();
        }
        if (q.Subject != null || q.Description != null || q.CategoryId == null) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        if (!TicketWorkflow.CanTransition(ticket.Status, q.Status, agent) || !agent && (q.Priority != ticket.Priority || q.CategoryId != ticket.CategoryId || q.AssigneeId != ticket.AssigneeId))
            return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        if (q.CategoryId != ticket.CategoryId && !await db.Set<SupportCategoryRow>().AnyAsync(x => x.Id == q.CategoryId && x.Active, ct)) return Result.Fail("support.category_invalid", ErrorKind.Validation);
        if (q.AssigneeId != null && q.AssigneeId != ticket.AssigneeId && !await tickets.Agents().ContainsAsync(q.AssigneeId.Value, ct)) return Result.Fail("support.assignee_invalid", ErrorKind.Validation);
        if (ticket.Status != q.Status) { tickets.History(ticket, "status", q.Status); await tickets.Notify(ticket.RequesterId == context.ActorId ? ticket.AssigneeId : ticket.RequesterId, ticket.Id, ct); }
        if (ticket.AssigneeId != q.AssigneeId) { tickets.History(ticket, "assignment", q.AssigneeId?.ToString() ?? "", internalNote: true); await tickets.Notify(q.AssigneeId, ticket.Id, ct); }
        if (ticket.Priority != q.Priority) tickets.History(ticket, "priority", q.Priority);
        if (ticket.CategoryId != q.CategoryId) tickets.History(ticket, "category");
        ticket.Status = q.Status; ticket.Priority = q.Priority; ticket.CategoryId = q.CategoryId; ticket.AssigneeId = q.AssigneeId;
        tickets.Touch(ticket); tickets.Audit(ticket, "updated"); return Result.Success();
    }
}
