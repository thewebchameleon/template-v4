using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public static class AccountDelivery
{
    public static bool CanReceiveEmail(AppUser user) =>
        user.Email is { Length: > 0 } email && !email.EndsWith("@example.invalid", StringComparison.OrdinalIgnoreCase);
}

public sealed record ResetPasswordRequest(Guid UserId, string Token, string Password);
public sealed record ConfirmEmailRequest(Guid UserId, string Token);
public sealed record ForgotPasswordRequest(string Email);
public sealed record CultureRequest(string Culture);
public sealed record InvitationRequest(Guid UserId, bool Cancel = false);
public sealed class AccountService(FrameworkDb db, UserManager<AppUser> users, IEventOutbox outbox, IDataProtectionProvider protection, IConfiguration config, TimeProvider time, SharedRateLimiter limiter, CultureCatalog cultures)
{
    private readonly IDataProtector _protector = protection.CreateProtector("TemplateV4.email.action.v1");
    public async Task<Result<Unit>> Invitation(Guid actor, InvitationRequest request, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({request.UserId.ToString()}, 0))", ct);
        var user = await users.FindByIdAsync(request.UserId.ToString());
        var profile = await db.Profiles.SingleOrDefaultAsync(x => x.Id == request.UserId, ct);
        if (user is null || profile is null || user.PasswordHash is not null) return Result.Fail("invitation.not_pending", ErrorKind.Conflict);
        await users.UpdateSecurityStampAsync(user);
        if (request.Cancel) profile.SetDisabled(true);
        else
        {
            if (profile.Disabled) return Result.Fail("invitation.disabled", ErrorKind.Conflict);
            if (!await limiter.Allow("invitation", user.Id.ToString(), 1, TimeSpan.FromMinutes(2), ct)) return Result.Fail("invitation.wait", ErrorKind.Conflict);
            await QueueAction(user, user.EmailConfirmed ? EmailTemplate.PasswordReset : EmailTemplate.Verification, profile.Culture, ct);
        }
        db.Audit.Add(new() { ActorId = actor, SubjectId = user.Id, Action = request.Cancel ? "invitation.cancelled" : "invitation.resent", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task QueueAction(AppUser user, EmailTemplate template, string culture, CancellationToken ct)
    {
        var token = template == EmailTemplate.Verification ? await users.GenerateEmailConfirmationTokenAsync(user) : await users.GeneratePasswordResetTokenAsync(user);
        // Fragment prevents account-action secrets appearing in proxy request URLs and referrers.
        var url = $"{config["Web:PublicUrl"]?.TrimEnd('/')}/account#{Uri.EscapeDataString(template.ToString())}/{user.Id}/{Uri.EscapeDataString(token)}";
        outbox.Add(new EmailRequest(user.Id, template, culture, _protector.Protect(url)));
        await db.SaveChangesAsync(ct);
    }
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
    public async Task<Result<Unit>> Confirm(ConfirmEmailRequest request, CancellationToken ct)
    {
        var user = await users.FindByIdAsync(request.UserId.ToString());
        if (user is null || string.IsNullOrWhiteSpace(request.Token) || request.Token.Length > 4096) return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({user.Id.ToString()}, 0))", ct);
        await db.Entry(user).ReloadAsync(ct);
        if (user.EmailConfirmed) return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        if (!(await users.ConfirmEmailAsync(user, request.Token)).Succeeded) return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        user.EmailMfaEnabled = true;
        user.PreferredMfaMethod = MfaMethods.Email;
        var profile = await db.Profiles.SingleAsync(x => x.Id == user.Id, ct);
        if (user.PasswordHash is null) await QueueAction(user, EmailTemplate.PasswordReset, profile.Culture, ct);
        else await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<Unit>> Reset(ResetPasswordRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Token) || request.Token.Length > 4096 || string.IsNullOrWhiteSpace(request.Password) || request.Password.Length > 1024)
            return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        var user = await users.FindByIdAsync(request.UserId.ToString());
        if (user is null || !user.EmailConfirmed) return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var reset = await users.ResetPasswordAsync(user, request.Token, request.Password);
        if (!reset.Succeeded) return Result<Unit>.Fail("validation.failed", ErrorKind.Validation, new() { ["password"] = reset.Errors.Select(x => x.Description).ToArray() });
        await db.Sessions.Where(x => x.UserId == user.Id && x.RevokedAt == null).ExecuteUpdateAsync(x => x.SetProperty(s => s.RevokedAt, time.GetUtcNow()), ct);
        var profile = await db.Profiles.SingleAsync(x => x.Id == user.Id, ct);
        if (AccountDelivery.CanReceiveEmail(user))
            outbox.Add(new EmailRequest(user.Id, EmailTemplate.SecurityNotification, profile.Culture));
        db.Audit.Add(new() { Action = "auth.password_reset", SubjectId = user.Id, ActorId = user.Id, At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<Unit>> SetCulture(Guid userId, CultureRequest request, CancellationToken ct)
    {
        if (!cultures.Supported.Contains(request.Culture)) return Result.Fail("culture.unsupported", ErrorKind.Validation);
        var profile = await db.Profiles.SingleAsync(x => x.Id == userId, ct);
        profile.SetCulture(request.Culture);
        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
