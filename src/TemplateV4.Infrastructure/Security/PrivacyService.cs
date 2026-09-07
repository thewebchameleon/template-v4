using System.Net.Mail;
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed record ChangeEmailRequest(string Email, SecurityProof Proof);
public sealed record ConfirmEmailChangeRequest(string Challenge);
public sealed record ReviewDeletionRequest(Guid Id, bool Approve);
public sealed record DeletionItem(Guid Id, Guid UserId, string? DisplayName, string State, DateTimeOffset RequestedAt, DateTimeOffset? ReviewedAt);
public sealed record PrivacyStatus(DeletionItem? Request, int DeletedFileRetentionDays, int NotificationRetentionDays, string ReviewPolicy = "AdministratorReview");
internal sealed record EmailChangeState(string Email, string Token);

public sealed class PrivacyService(FrameworkDb db, UserManager<AppUser> users, SecurityService security, SharedRateLimiter limiter, IEventOutbox outbox, IDataProtectionProvider protection, IConfiguration config, TimeProvider time)
{
    private readonly IDataProtector _recipient = protection.CreateProtector("TemplateV4.email.recipient.v1");
    private readonly IDataProtector _action = protection.CreateProtector("TemplateV4.email.action.v1");
    public async Task<PrivacyStatus> Status(Guid actor, CancellationToken ct)
    {
        var request = await db.DeletionRequests.AsNoTracking().Where(x => x.UserId == actor).OrderByDescending(x => x.State == "Pending").ThenByDescending(x => x.RequestedAt).ThenByDescending(x => x.Id)
            .Select(x => new DeletionItem(x.Id, x.UserId, null, x.State, x.RequestedAt, x.ReviewedAt)).FirstOrDefaultAsync(ct);
        return new(request, Math.Clamp(config.GetValue("Privacy:DeletedFileRetentionDays", 30), 1, 365), Math.Clamp(config.GetValue("Privacy:NotificationRetentionDays", 90), 7, 365));
    }
    public async Task<byte[]> Export(Guid actor, CancellationToken ct)
    {
        // Explicit allowlist: never serialize Identity entities, credential material, challenges or message payloads.
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.RepeatableRead, ct);
        var profile = await db.Profiles.AsNoTracking().Where(x => x.Id == actor).Select(x => new { x.Id, x.DisplayName, x.Culture }).SingleAsync(ct);
        var account = await db.Users.AsNoTracking().Where(x => x.Id == actor).Select(x => new { x.Email, x.EmailConfirmed, x.OptionalEmailEnabled }).SingleAsync(ct);
        var sessions = await db.Sessions.AsNoTracking().Where(x => x.UserId == actor).Select(x => new { x.Device, x.CreatedAt, x.ExpiresAt, x.RevokedAt }).ToArrayAsync(ct);
        var notifications = await db.Notifications.AsNoTracking().Where(x => x.UserId == actor).Select(x => new { x.Kind, x.Link, x.CreatedAt, x.ReadAt }).ToArrayAsync(ct);
        var files = await db.Files.AsNoTracking().Where(x => x.OwnerId == actor).Select(x => new { x.Id, x.Name, x.Size, x.ContentType, x.CreatedAt, x.DeletedAt, x.PurgedAt }).ToArrayAsync(ct);
        var requests = await db.DeletionRequests.AsNoTracking().Where(x => x.UserId == actor).Select(x => new { x.State, x.RequestedAt, x.ReviewedAt }).ToArrayAsync(ct);
        var activity = await db.Audit.AsNoTracking().Where(x => x.SubjectId == actor).Select(x => new { x.Action, x.At }).ToArrayAsync(ct);
        var result = JsonSerializer.SerializeToUtf8Bytes(new { ExportedAt = time.GetUtcNow(), Profile = profile, Account = account, Sessions = sessions, Notifications = notifications, Files = files, DeletionRequests = requests, Activity = activity }, new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = true });
        db.Audit.Add(new() { ActorId = actor, SubjectId = actor, Action = "privacy.exported", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return result;
    }
    public async Task<Result<Unit>> ChangeEmail(Guid actor, ChangeEmailRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || request.Email.Length > 254 || !MailAddress.TryCreate(request.Email, out var address) || address.Address != request.Email)
            return Result.Fail("validation.failed", ErrorKind.Validation);
        if (!await limiter.Allow("change-email", actor.ToString(), 1, TimeSpan.FromMinutes(2), ct)) return Result.Fail("invitation.wait", ErrorKind.Conflict);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var user = (await users.FindByIdAsync(actor.ToString()))!;
        if (!await security.Proof(user, request.Proof, ct)) { await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Fail("auth.factor_invalid", ErrorKind.Forbidden); }
        if (string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase)) return Result.Fail("privacy.same_email", ErrorKind.Validation);
        if (await users.FindByEmailAsync(request.Email) is not null) return Result.Fail("privacy.email_unavailable", ErrorKind.Conflict);
        await db.AuthChallenges.Where(x => x.UserId == actor && x.Purpose == "email-change").ExecuteDeleteAsync(ct);
        var token = await users.GenerateChangeEmailTokenAsync(user, request.Email);
        var challenge = await security.Challenge(user, "email-change", JsonSerializer.Serialize(new EmailChangeState(request.Email, token)), null, ct, TimeSpan.FromHours(2));
        var culture = await db.Profiles.Where(x => x.Id == actor).Select(x => x.Culture).SingleAsync(ct);
        var url = $"{config["Web:PublicUrl"]?.TrimEnd('/')}/account#EmailChange/{Uri.EscapeDataString(challenge)}";
        outbox.Add(new EmailRequest(actor, EmailTemplate.Verification, culture, _action.Protect(url), ProtectedRecipient: _recipient.Protect(request.Email)));
        outbox.Add(new EmailRequest(actor, EmailTemplate.SecurityNotification, culture, ProtectedRecipient: _recipient.Protect(user.Email!)));
        db.Audit.Add(new() { ActorId = actor, SubjectId = actor, Action = "account.email_change_requested", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<Unit>> ConfirmEmail(ConfirmEmailChangeRequest request, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        if (string.IsNullOrWhiteSpace(request.Challenge) || request.Challenge.Length > 128) return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        var hash = AuthService.Hash(request.Challenge);
        var subject = await db.AuthChallenges.AsNoTracking().Where(x => x.Id == hash && x.Purpose == "email-change").Select(x => x.UserId).SingleOrDefaultAsync(ct);
        if (subject is null) return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        // Account flows lock the user before challenge rows to avoid lock-order inversions.
        await security.Lock(subject.Value, ct);
        var challenge = await security.ReadChallenge(request.Challenge, "email-change", ct);
        if (challenge?.Row.UserId is not { } id) return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        await security.Lock(id, ct);
        var user = await users.FindByIdAsync(id.ToString());
        if (user is null || user.SecurityStamp != challenge.Row.SecurityStamp || !await db.Profiles.AnyAsync(x => x.Id == id && !x.Disabled, ct)) return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        var state = JsonSerializer.Deserialize<EmailChangeState>(challenge.State)!;
        if (!(await users.ChangeEmailAsync(user, state.Email, state.Token)).Succeeded || !(await users.SetUserNameAsync(user, state.Email)).Succeeded)
            return Result.Fail("privacy.email_unavailable", ErrorKind.Conflict);
        await users.UpdateSecurityStampAsync(user);
        db.AuthChallenges.Remove(challenge.Row);
        await db.Sessions.Where(x => x.UserId == id && x.RevokedAt == null).ExecuteUpdateAsync(x => x.SetProperty(s => s.RevokedAt, time.GetUtcNow()), ct);
        db.Audit.Add(new() { ActorId = id, SubjectId = id, Action = "account.email_changed", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<Unit>> RequestDeletion(Guid actor, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await security.Lock(actor, ct);
        if (!await db.DeletionRequests.AnyAsync(x => x.UserId == actor && x.State == "Pending", ct))
        {
            db.DeletionRequests.Add(new() { UserId = actor, RequestedAt = time.GetUtcNow() });
            db.Audit.Add(new() { ActorId = actor, SubjectId = actor, Action = "privacy.deletion_requested", At = time.GetUtcNow() });
            db.Notifications.Add(new() { UserId = actor, Kind = "notificationDeletionRequested", Link = "/privacy", CreatedAt = time.GetUtcNow() });
        }
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<Unit>> Withdraw(Guid actor, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await security.Lock(actor, ct);
        var request = await db.DeletionRequests.SingleOrDefaultAsync(x => x.UserId == actor && x.State == "Pending", ct);
        if (request is null) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        request.State = "Withdrawn"; request.ReviewedAt = time.GetUtcNow();
        db.Audit.Add(new() { ActorId = actor, SubjectId = actor, Action = "privacy.deletion_withdrawn", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
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
            profile.Anonymise(time.GetUtcNow());
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
            await db.Files.Where(x => x.OwnerId == user.Id && x.DeletedAt == null).ExecuteUpdateAsync(x => x.SetProperty(f => f.DeletedAt, time.GetUtcNow()), ct);
            request.State = "Approved";
        }
        else
        {
            request.State = "Declined";
            db.Notifications.Add(new() { UserId = user.Id, Kind = "notificationDeletionDeclined", Link = "/privacy", CreatedAt = time.GetUtcNow() });
        }
        request.ReviewedAt = time.GetUtcNow(); request.ReviewedBy = actor;
        db.Audit.Add(new() { ActorId = actor, SubjectId = user.Id, Action = command.Approve ? "privacy.account_anonymised" : "privacy.deletion_declined", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
