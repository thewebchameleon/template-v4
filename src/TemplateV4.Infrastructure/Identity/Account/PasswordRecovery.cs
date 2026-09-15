using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class AccountService
{
    public async Task Forgot(ForgotPasswordRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || request.Email.Length > 254) return;
        if (!await limiter.Allow("email-action", request.Email.Trim().ToUpperInvariant(), 1, TimeSpan.FromMinutes(2), ct)) return;
        var user = await users.FindByEmailAsync(request.Email);
        if (user is null) { await Task.Delay(200, ct); return; }
        if (!AccountDelivery.CanReceiveEmail(user)) return;
        var profile = await db.Profiles.SingleOrDefaultAsync(x => x.Id == user.Id && !x.Disabled, ct);
        if (profile is null) return;
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await QueueAction(user, user.EmailConfirmed ? EmailTemplate.PasswordReset : EmailTemplate.Verification, profile.Culture, ct);
        await tx.CommitAsync(ct);
    }
    public async Task<Result<Unit>> Reset(ResetPasswordRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Token) || request.Token.Length > 4096 || string.IsNullOrWhiteSpace(request.Password) || request.Password.Length > 1024)
            return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        var user = await users.FindByIdAsync(request.UserId.ToString());
        if (user is null || !user.EmailConfirmed) return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({user.Id.ToString()}, 0))", ct);
        await db.Entry(user).ReloadAsync(ct);
        if (!await db.Profiles.AnyAsync(x => x.Id == user.Id && !x.Disabled, ct) || user.InvitationCancelledAt != null || user.PasswordHash is null && user.InvitationExpiresAt < time.GetUtcNow()) return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        var accepting = user.PasswordHash is null;
        var reset = await users.ResetPasswordAsync(user, request.Token, request.Password);
        if (!reset.Succeeded) return Result<Unit>.Fail("validation.failed", ErrorKind.Validation, new() { ["password"] = reset.Errors.Select(x => x.Description).ToArray() });
        await db.Sessions.Where(x => x.UserId == user.Id && x.RevokedAt == null).ExecuteUpdateAsync(x => x.SetProperty(s => s.RevokedAt, time.GetUtcNow()), ct);
        var profile = await db.Profiles.SingleAsync(x => x.Id == user.Id, ct);
        if (accepting) { user.InvitationAcceptedAt = time.GetUtcNow(); db.Audit.Add(new() { Action = "invitation.accepted", SubjectId = user.Id, ActorId = user.Id, At = time.GetUtcNow() }); }
        if (AccountDelivery.CanReceiveEmail(user))
            outbox.Add(new EmailRequest(user.Id, EmailTemplate.SecurityNotification, profile.Culture));
        db.Audit.Add(new() { Action = "auth.password_reset", SubjectId = user.Id, ActorId = user.Id, At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
