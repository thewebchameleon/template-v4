using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class PrivacyService(FrameworkDb db, UserManager<AppUser> users, SecurityService security, SharedRateLimiter limiter, IEventOutbox outbox, IDataProtectionProvider protection, IConfiguration config, TimeProvider time, TemplateV4.Application.Platform.IActionItems actionItems, IEnumerable<TemplateV4.Application.Privacy.IPrivacyContributor> contributors)
{
    private readonly IDataProtector _recipient = protection.CreateProtector("TemplateV4.email.recipient.v1");
    private readonly IDataProtector _action = protection.CreateProtector("TemplateV4.email.action.v1");
    public async Task<PrivacyStatus> Status(Guid actor, CancellationToken ct)
    {
        var request = await db.DeletionRequests.AsNoTracking().Where(x => x.UserId == actor).OrderByDescending(x => x.State == "Pending").ThenByDescending(x => x.RequestedAt).ThenByDescending(x => x.Id)
            .Select(x => new DeletionItem(x.Id, x.UserId, null, x.State, x.RequestedAt, x.ReviewedAt)).FirstOrDefaultAsync(ct);
        return new(request, Math.Clamp(config.GetValue("Privacy:DeletedFileRetentionDays", 30), 1, 365), Math.Clamp(config.GetValue("Privacy:NotificationRetentionDays", 90), 7, 365));
    }
}

public sealed record ChangeEmailRequest(string Email, SecurityProof Proof);

public sealed record ConfirmEmailChangeRequest(string Challenge);

public sealed record ReviewDeletionRequest(Guid Id, bool Approve);

public sealed record DeletionItem(Guid Id, Guid UserId, string? DisplayName, string State, DateTimeOffset RequestedAt, DateTimeOffset? ReviewedAt);

public sealed record PrivacyStatus(DeletionItem? Request, int DeletedFileRetentionDays, int NotificationRetentionDays, string ReviewPolicy = "AdministratorReview");

internal sealed record EmailChangeState(string Email, string Token);
