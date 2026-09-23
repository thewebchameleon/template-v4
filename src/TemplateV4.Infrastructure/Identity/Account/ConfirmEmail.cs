using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class AccountService
{
    public async Task<Result<Unit>> Confirm(ConfirmEmailRequest request, CancellationToken ct)
    {
        var user = await users.FindByIdAsync(request.UserId.ToString());
        if (user is null || string.IsNullOrWhiteSpace(request.Token) || request.Token.Length > 4096) return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        await using var tx = await db.Session.BeginTransactionAsync(ct);
        await customers.Lock(ct);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({user.Id.ToString()}, 0))", ct);
        await db.Entry(user).ReloadAsync(ct);
        if (!await db.Profiles.AnyAsync(x => x.Id == user.Id && !x.Disabled, ct) || user.InvitationCancelledAt != null) return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        if (user.EmailConfirmed) return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        if (user.RegistrationState == "NotRequired" && !await entitlements.CanActivateUser(user.Id, ct))
            return Result.Fail("commercial-billing.seats", ErrorKind.Conflict);
        if (!(await users.ConfirmEmailAsync(user, request.Token)).Succeeded) return Result.Fail("auth.action_invalid", ErrorKind.Validation);
        if (user.RegistrationState == "Pending") await actionItems.AddReview("Registration", user.Id, user.Id, "registrationReviewAction", "/administration/users/registration-requests", ct);
        user.EmailMfaEnabled = true;
        user.PreferredMfaMethod = MfaMethods.Email;
        var profile = await db.Profiles.SingleAsync(x => x.Id == user.Id, ct);
        if (user.PasswordHash is null) await QueueAction(user, EmailTemplate.PasswordReset, profile.Culture, ct);
        else await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct); return Result.Success();
    }
}
