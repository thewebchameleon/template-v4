using TemplateV4.Application.Support;

namespace TemplateV4.Infrastructure.Support;

public sealed partial class SupportTicketStore
{
    public async Task<Result<Unit>> Reply(ReplyTicket q, CancellationToken ct)
    {
        if (!await Available(ct)) return Result.Fail("support.not_found", ErrorKind.NotFound);
        var agent = await Agent(ct);
        if (q.Internal && !agent) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var ticket = await Lock(q.Id, agent, ct);
        if (ticket == null) return Result.Fail("support.not_found", ErrorKind.NotFound);
        if (ticket.Version != q.Version) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (ticket.Status is "Closed" or "Resolved") return Result.Fail("support.reopen_required", ErrorKind.Conflict);
        History(ticket, "reply", q.Body.Trim(), q.Internal);
        if (!q.Internal && ticket.RequesterId == context.ActorId && ticket.Status == "WaitingOnRequester") { ticket.Status = "Open"; History(ticket, "status", "Open"); }
        Touch(ticket); Audit(ticket, q.Internal ? "internal_note" : "replied");
        if (!q.Internal) await Notify(ticket.RequesterId == context.ActorId ? ticket.AssigneeId : ticket.RequesterId, ticket.Id, ct);
        return Result.Success();
    }
}
