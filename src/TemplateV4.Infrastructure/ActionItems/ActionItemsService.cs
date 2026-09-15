using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure;

public sealed partial class ActionItemsService(FrameworkDb db, TimeProvider time) : IActionItems
{
    private IQueryable<Guid> Administrators => from membership in db.UserRoles join role in db.Roles on membership.RoleId equals role.Id where role.Name == "Administrator" select membership.UserId;
    private IQueryable<Guid> Holders(string permission) => from membership in db.UserRoles join claim in db.RoleClaims on membership.RoleId equals claim.RoleId where claim.ClaimType == "permission" && claim.ClaimValue == permission select membership.UserId;
    private IQueryable<Guid> ActiveUsers => from user in db.Users join profile in db.Profiles on user.Id equals profile.Id where !profile.Disabled && user.EmailConfirmed && user.PasswordHash != null && user.RegistrationState != "Pending" && user.RegistrationState != "Rejected" select user.Id;
    // Responsibility (Administrator membership) and authorization are separate checks.
    private async Task<string[]> EligibleQueues(Guid actor, CancellationToken ct) =>
        await Administrators.ContainsAsync(actor, ct) && await Holders(Permissions.Settings).ContainsAsync(actor, ct)
            ? ActionQueues.All.Select(x => x.Id).ToArray() : [];

    private async Task Notify(ActionItemRow row, CancellationToken ct)
    {
        var recipients = ActiveUsers.Where(x => row.AssigneeId == x || row.QueueId != null && Administrators.Contains(x) && Holders(Permissions.Settings).Contains(x));
        foreach (var id in await recipients.Distinct().ToArrayAsync(ct)) db.Notifications.Add(new() { UserId = id, Kind = "notificationActionAssigned", Link = "/action-items", CreatedAt = time.GetUtcNow() });
    }

    private static bool ValidLink(string? link) => link is { Length: > 1 and <= 1000 } && link.StartsWith('/') && !link.StartsWith("//", StringComparison.Ordinal) && !link.Any(c => char.IsControl(c) || char.IsWhiteSpace(c) || c is '\\' or '%') && !link.StartsWith("/api", StringComparison.OrdinalIgnoreCase) && Uri.TryCreate(new Uri("https://application.invalid"), link, out var uri) && uri.Host == "application.invalid";
}
