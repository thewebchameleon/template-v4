using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure;

public sealed partial class ActionItemsService
{

    public async Task<Result<Guid>> Create(Guid actor, CreateActionItem request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Trim().Length > 160 || request.Description is null || request.Description.Length > 2000 ||
            !ValidLink(request.Link) || (request.AssigneeId is null) == (request.QueueId is null) || request.QueueId is not null && !ActionQueues.All.Any(x => x.Id == request.QueueId))
            return Result<Guid>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Session.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", ct);
        if (!await ActiveUsers.ContainsAsync(actor, ct) || request.AssigneeId is { } assignee && !await ActiveUsers.ContainsAsync(assignee, ct)) return Result<Guid>.Fail("validation.failed", ErrorKind.Validation);
        var row = new ActionItemRow { Title = request.Title.Trim(), Description = request.Description.Trim(), Link = request.Link, CreatorId = actor, AssigneeId = request.AssigneeId, QueueId = request.QueueId, CreatedAt = time.GetUtcNow() };
        db.Add(row);
        await Notify(row, ct);
        db.Audit.Add(new() { ActorId = actor, SubjectId = row.Id, Action = "action_item.created", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<Guid>.Success(row.Id);
    }
}
