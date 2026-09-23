using System.Net.Mail;
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class PrivacyService
{
    public async Task<Result<Unit>> ChangeEmail(Guid actor, ChangeEmailRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || request.Email.Length > 254 || !MailAddress.TryCreate(request.Email, out var address) || address.Address != request.Email)
            return Result.Fail("validation.failed", ErrorKind.Validation);
        if (!await limiter.Allow("change-email", actor.ToString(), 1, TimeSpan.FromMinutes(2), ct)) return Result.Fail("invitation.wait", ErrorKind.Conflict);
        await using var tx = await db.Session.BeginTransactionAsync(ct);
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
        await using var tx = await db.Session.BeginTransactionAsync(ct);
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
        if (!(await users.ChangeEmailAsync(user, state.Email, state.Token)).Succeeded)
            return Result.Fail("privacy.email_unavailable", ErrorKind.Conflict);
        await users.UpdateSecurityStampAsync(user);
        db.AuthChallenges.Remove(challenge.Row);
        await db.Sessions.Where(x => x.UserId == id && x.RevokedAt == null).ExecuteUpdateAsync(x => x.SetProperty(s => s.RevokedAt, time.GetUtcNow()), ct);
        db.Audit.Add(new() { ActorId = id, SubjectId = id, Action = "account.email_changed", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
