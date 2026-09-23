using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class PrivacyService
{
    public async Task<Result<Unit>> RequestDeletion(Guid actor, CancellationToken ct)
    {
        await using var tx = await db.Session.BeginTransactionAsync(ct); await security.Lock(actor, ct);
        if (!await db.DeletionRequests.AnyAsync(x => x.UserId == actor && x.State == "Pending", ct))
        {
            var deletion = new DeletionRequest { UserId = actor, RequestedAt = time.GetUtcNow() };
            db.DeletionRequests.Add(deletion);
            await actionItems.AddReview("Privacy", deletion.Id, actor, "privacyReviewAction", "/administration/users/privacy-requests", ct);
            db.Audit.Add(new() { ActorId = actor, SubjectId = actor, Action = "privacy.deletion_requested", At = time.GetUtcNow() });
            db.Notifications.Add(new() { UserId = actor, Kind = "notificationDeletionRequested", Link = "/privacy", CreatedAt = time.GetUtcNow() });
        }
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<Unit>> Withdraw(Guid actor, CancellationToken ct)
    {
        await using var tx = await db.Session.BeginTransactionAsync(ct); await security.Lock(actor, ct);
        var request = await db.DeletionRequests.SingleOrDefaultAsync(x => x.UserId == actor && x.State == "Pending", ct);
        if (request is null) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        await actionItems.ResolveReview("Privacy", request.Id, actor, ct);
        request.State = "Withdrawn"; request.ReviewedAt = time.GetUtcNow();
        db.Audit.Add(new() { ActorId = actor, SubjectId = actor, Action = "privacy.deletion_withdrawn", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
