using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Customers;
using TemplateV4.Application.CommercialBilling;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Customers;

public sealed class CustomerAccess(FrameworkDb db) : ICustomerAccess
{
    private static readonly string[] TimeZones = TimeZoneInfo.GetSystemTimeZones()
        .Select(x => x.HasIanaId ? x.Id : TimeZoneInfo.TryConvertWindowsIdToIanaId(x.Id, out var id) ? id : null)
        .OfType<string>().Append("UTC").Distinct(StringComparer.Ordinal).Order(StringComparer.Ordinal).ToArray();
    public Task Lock(CancellationToken ct) => MutationLock(db, ct);
    public async Task<CustomerInfo?> Find(Guid actor, CancellationToken ct)
    {
        if (!await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct) || !await db.Users.AnyAsync(x => x.Id == actor && x.EmailConfirmed && (x.RegistrationState == "Approved" || x.RegistrationState == "NotRequired"), ct)) return null;
        var row = await db.Set<CustomerRow>().AsNoTracking().SingleAsync(ct);
        var administrator = await (from assignment in db.UserRoles
                                   join claim in db.RoleClaims on assignment.RoleId equals claim.RoleId
                                   where assignment.UserId == actor && claim.ClaimType == "permission" && claim.ClaimValue == CommercialBillingPermissions.Manage
                                   select assignment).AnyAsync(ct);
        var activeUsers = await (from profile in db.Profiles
                                 join user in db.Users on profile.Id equals user.Id
                                 where !profile.Disabled && user.EmailConfirmed && (user.RegistrationState == "Approved" || user.RegistrationState == "NotRequired")
                                 select user.Id).CountAsync(ct);
        return new(row.Id, row.Name, row.WebsiteUrl, row.ContactEmail, row.TimeZone, row.Country, row.PrimaryContactNumber,
            row.LogoId is null ? null : $"/api/v1/auth/appearance/logos/{row.LogoId}",
            administrator, activeUsers, row.Version, TimeZones);
    }
    public static Task MutationLock(FrameworkDb db, CancellationToken ct) => db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842002)", ct);
}
