using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class PrivacyService
{
    public async Task<Result<Page<DeletionItem>>> Requests(int pageNumber, int pageSize, string sort, string direction, CancellationToken ct)
    {
        if (pageNumber is < 1 or > 10000 || pageSize is < 1 or > 100 || sort is not ("displayName" or "requestedAt") || direction is not ("asc" or "desc")) return Result<Page<DeletionItem>>.Fail("validation.failed", ErrorKind.Validation);
        var source = db.DeletionRequests.AsNoTracking().Where(x => x.State == "Pending");
        var total = await source.CountAsync(ct);
        var descending = direction == "desc";
        var ordered = sort switch
        {
            "displayName" when descending => source.OrderByDescending(x => db.Profiles.Where(p => p.Id == x.UserId).Select(p => p.DisplayName).FirstOrDefault()).ThenByDescending(x => x.Id),
            "displayName" => source.OrderBy(x => db.Profiles.Where(p => p.Id == x.UserId).Select(p => p.DisplayName).FirstOrDefault()).ThenBy(x => x.Id),
            _ when descending => source.OrderByDescending(x => x.RequestedAt).ThenByDescending(x => x.Id),
            _ => source.OrderBy(x => x.RequestedAt).ThenBy(x => x.Id)
        };
        var items = await ordered.Skip((pageNumber - 1) * pageSize).Take(pageSize)
            .Select(x => new DeletionItem(x.Id, x.UserId, db.Profiles.Where(p => p.Id == x.UserId).Select(p => p.DisplayName).FirstOrDefault(), x.State, x.RequestedAt, x.ReviewedAt)).ToArrayAsync(ct);
        return Result<Page<DeletionItem>>.Success(new(items, total, pageNumber, pageSize));
    }
    public async Task<Result<Unit>> Review(Guid actor, ReviewDeletionRequest command, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", ct);
        if (!await db.UserRoles.AnyAsync(x => x.UserId == actor && db.Roles.Any(r => r.Id == x.RoleId && r.Name == "Administrator"), ct)) return Result.Fail("auth.forbidden", ErrorKind.Forbidden);
        var request = await db.DeletionRequests.AsNoTracking().SingleOrDefaultAsync(x => x.Id == command.Id, ct);
        if (request is null) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        await security.Lock(request.UserId, ct);
        request = await db.DeletionRequests.SingleAsync(x => x.Id == command.Id, ct);
        if (request.State != "Pending") return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (actor == request.UserId) return Result.Fail("user.self_lockout", ErrorKind.Conflict);
        var user = (await users.FindByIdAsync(request.UserId.ToString()))!;
        var profile = await db.Profiles.SingleAsync(x => x.Id == user.Id, ct);
        if (command.Approve)
        {
            await TemplateV4.Infrastructure.Customers.CustomerAccess.MutationLock(db, ct);
            await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({user.Id.ToString()}, 0))", ct);
            // CRM customers are independent business records, not this identity account.
            // Remove staff assignment while retaining organisation records and issued snapshots.
            var assignments = await db.Set<TemplateV4.Infrastructure.Crm.CrmRecordRow>()
                .FromSqlInterpolated($"SELECT * FROM crm.records WHERE \"Data\" ->> 'ownerId' = {user.Id.ToString()}").ToArrayAsync(ct);
            foreach (var record in assignments)
            {
                var data = JsonSerializer.Deserialize<TemplateV4.Application.Crm.CrmRecordInput>(record.Data, new JsonSerializerOptions(JsonSerializerDefaults.Web))!;
                if (data.OwnerId != user.Id) continue;
                record.Data = JsonSerializer.Serialize(data with { OwnerId = null }, new JsonSerializerOptions(JsonSerializerDefaults.Web));
                record.Version = Guid.NewGuid();
            }
            if (await users.IsInRoleAsync(user, "Administrator"))
            {
                var admins = (await users.GetUsersInRoleAsync("Administrator")).Where(x => x.EmailConfirmed && x.PasswordHash != null).Select(x => x.Id).ToArray();
                if (!await db.Profiles.AnyAsync(x => admins.Contains(x.Id) && x.Id != user.Id && !x.Disabled, ct)) return Result.Fail("user.last_administrator", ErrorKind.Conflict);
            }
            user.Email = user.UserName = $"deleted-{user.Id:N}@example.invalid";
            user.NormalizedEmail = user.NormalizedUserName = user.Email.ToUpperInvariant();
            user.PasswordHash = null; user.PhoneNumber = null; user.PhoneNumberConfirmed = false;
            user.EmailConfirmed = false; user.EmailMfaEnabled = false; user.TwoFactorEnabled = false; user.OptionalEmailEnabled = false;
            user.SecurityStamp = Guid.NewGuid().ToString();
            user.PushEnabled = false; user.PushShowPreview = false;
            await db.Set<WebPushSubscription>().Where(x => x.UserId == user.Id).ExecuteDeleteAsync(ct);
            profile.Anonymise(time.GetUtcNow());
            await db.Set<UserAvatar>().Where(x => x.UserId == user.Id).ExecuteDeleteAsync(ct);
            // Erasure runs even when Support is disabled. Remove requester conversations and files,
            // and erase contributions to other requesters' tickets without retaining content in audit.
            await db.Set<SupportTicketRow>().Where(x => x.RequesterId == user.Id).ExecuteDeleteAsync(ct);
            await db.Set<SupportMessageRow>().Where(x => x.AuthorId == user.Id).ExecuteDeleteAsync(ct);
            await db.Set<SupportAttachmentRow>().Where(x => x.OwnerId == user.Id).ExecuteDeleteAsync(ct);
            await db.Set<SupportTicketRow>().Where(x => x.AssigneeId == user.Id).ExecuteUpdateAsync(x => x.SetProperty(t => t.AssigneeId, (Guid?)null).SetProperty(t => t.Version, Guid.NewGuid()), ct);
            await db.Set<ActionItemRow>().Where(x => x.CreatorId == user.Id || x.AssigneeId == user.Id || x.SubjectId == user.Id).ExecuteDeleteAsync(ct);
            // Historical display names and file names follow the existing account erasure policy.
            var ownedFiles = db.Files.Where(x => x.OwnerId == user.Id).Select(x => x.Id);
            await db.Audit.Where(x => x.ActorId == user.Id)
                .ExecuteUpdateAsync(x => x.SetProperty(a => a.ActorNameSnapshot, (string?)null), ct);
            await db.Audit.Where(x => x.SubjectId == user.Id || ownedFiles.Contains(x.SubjectId!.Value))
                .ExecuteUpdateAsync(x => x.SetProperty(a => a.SubjectNameSnapshot, (string?)null)
                    .SetProperty(a => a.ChangesJson, (string?)null).SetProperty(a => a.MetadataJson, (string?)null)
                    .SetProperty(a => a.RelatedEntitiesJson, (string?)null).SetProperty(a => a.Reason, (string?)null), ct);
            // Keep a payload-free tombstone until expiry, preventing recreation by an old command key.
            await db.Idempotency.Where(x => x.ActorId == user.Id || x.SubjectId == user.Id)
                .ExecuteUpdateAsync(x => x.SetProperty(r => r.Response, "").SetProperty(r => r.Erased, true), ct);
            await db.Sessions.Where(x => x.UserId == user.Id).ExecuteDeleteAsync(ct);
            await db.AuthChallenges.Where(x => x.UserId == user.Id).ExecuteDeleteAsync(ct);
            await db.UserTokens.Where(x => x.UserId == user.Id).ExecuteDeleteAsync(ct);
            await db.UserLogins.Where(x => x.UserId == user.Id).ExecuteDeleteAsync(ct);
            await db.UserClaims.Where(x => x.UserId == user.Id).ExecuteDeleteAsync(ct);
            await db.UserRoles.Where(x => x.UserId == user.Id).ExecuteDeleteAsync(ct);
            await db.Set<IdentityUserPasskey<Guid>>().Where(x => x.UserId == user.Id).ExecuteDeleteAsync(ct);
            await db.Notifications.Where(x => x.UserId == user.Id).ExecuteDeleteAsync(ct);
            // Remove encrypted email action/recipient data as well as credentials. Fencing stops
            // stale workers committing completion; an SMTP call already in flight cannot be recalled.
            await db.Database.ExecuteSqlInterpolatedAsync($"UPDATE messaging.outbox SET \"Payload\" = '{{}}', \"CompletedAt\" = {time.GetUtcNow()}, \"PoisonedAt\" = NULL, \"LeaseId\" = NULL, \"LeaseUntil\" = NULL WHERE \"Type\" = 'email.requested.v1' AND \"Payload\"::jsonb->>'UserId' = {user.Id.ToString()}", ct);
            await db.Set<MyFileShare>().Where(x => x.RecipientId == user.Id).ExecuteDeleteAsync(ct);
            await db.Files.Where(x => x.OwnerId == user.Id).ExecuteUpdateAsync(x => x.SetProperty(f => f.OwnerId, (Guid?)null), ct);
            request.State = "Approved";
        }
        else
        {
            request.State = "Declined";
            db.Notifications.Add(new() { UserId = user.Id, Kind = "notificationDeletionDeclined", Link = "/privacy", CreatedAt = time.GetUtcNow() });
        }
        await actionItems.ResolveReview("Privacy", request.Id, actor, ct);
        request.ReviewedAt = time.GetUtcNow(); request.ReviewedBy = actor;
        db.Audit.Add(new() { ActorId = actor, SubjectId = user.Id, Action = command.Approve ? "privacy.account_anonymised" : "privacy.deletion_declined", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
