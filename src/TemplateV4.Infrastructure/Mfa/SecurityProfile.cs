using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class SecurityService
{
    public async Task<ProfileResponse> Profile(Guid id, CancellationToken ct)
    {
        var user = (await users.FindByIdAsync(id.ToString()))!;
        var profile = await db.Profiles.AsNoTracking().SingleAsync(x => x.Id == id, ct);
        var methods = await ConfiguredMethods(user);
        var png = await db.Set<UserAvatar>().AsNoTracking().Where(x => x.UserId == id).Select(x => x.Png).SingleOrDefaultAsync(ct);
        return new(id, user.Email!, profile.DisplayName, profile.Culture, (await users.GetRolesAsync(user)).ToArray(), user.TwoFactorEnabled, await GloballyRequired(user, ct), await users.CountRecoveryCodesAsync(user),
            (await users.GetPasskeysAsync(user)).Select(x => new PasskeySummary(Microsoft.AspNetCore.WebUtilities.WebEncoders.Base64UrlEncode(x.CredentialId), x.Name ?? "Passkey", x.CreatedAt)).ToArray(), user.EmailMfaEnabled, methods, PreferredMethod(user, methods),
            profile.FirstName, profile.LastName, user.PhoneNumber, profile.TimeZone, png is null ? null : "data:image/png;base64," + Convert.ToBase64String(png), profile.Version, await PasskeyRequired(user, ct));
    }
}
