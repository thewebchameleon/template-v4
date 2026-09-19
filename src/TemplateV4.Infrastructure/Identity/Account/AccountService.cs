using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application;
using TemplateV4.Application.CommercialBilling;
using TemplateV4.Application.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class AccountService(FrameworkDb db, UserManager<AppUser> users, IEventOutbox outbox, IDataProtectionProvider protection, IConfiguration config, TimeProvider time, SharedRateLimiter limiter, CultureCatalog cultures, AccessManagementService access, TemplateV4.Application.Platform.IActionItems actionItems, SecurityService security, ICustomerAccess customers, ICommercialEntitlements entitlements, TemplateV4.Application.FileStorage.IStorageQuota storageQuota)
{
    private readonly IDataProtector _protector = protection.CreateProtector("TemplateV4.email.action.v1");
    public async Task QueueAction(AppUser user, EmailTemplate template, string culture, CancellationToken ct)
    {
        if (user.PasswordHash is null)
        {
            if (user.InvitationCancelledAt != null || !await db.Profiles.AnyAsync(x => x.Id == user.Id && !x.Disabled, ct)) return;
            user.InvitationSentAt = time.GetUtcNow(); user.InvitationExpiresAt = time.GetUtcNow().AddHours(2);
        }
        var token = template == EmailTemplate.Verification ? await users.GenerateEmailConfirmationTokenAsync(user) : await users.GeneratePasswordResetTokenAsync(user);
        // Fragment prevents account-action secrets appearing in proxy request URLs and referrers.
        var url = $"{config["Web:PublicUrl"]?.TrimEnd('/')}/account#{Uri.EscapeDataString(template.ToString())}/{user.Id}/{Uri.EscapeDataString(token)}";
        outbox.Add(new EmailRequest(user.Id, template, culture, _protector.Protect(url)));
        await db.SaveChangesAsync(ct);
    }
}

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

public sealed record InvitationItem(Guid Id, string DisplayName, string Email, string State, bool EmailConfirmed, DateTimeOffset? SentAt, DateTimeOffset? ExpiresAt, DateTimeOffset? AcceptedAt, DateTimeOffset? ResendAt);

public sealed record InvitationPage(IReadOnlyList<InvitationItem> Items, int Total, int PageNumber, int PageSize, int Pending, int Expired, int Accepted, int Revoked);
