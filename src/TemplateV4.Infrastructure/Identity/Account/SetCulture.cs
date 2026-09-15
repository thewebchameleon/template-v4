using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class AccountService
{
    public async Task<Result<Unit>> SetCulture(Guid userId, CultureRequest request, CancellationToken ct)
    {
        if (!cultures.Supported.Contains(request.Culture)) return Result.Fail("culture.unsupported", ErrorKind.Validation);
        var profile = await db.Profiles.SingleAsync(x => x.Id == userId, ct);
        profile.SetCulture(request.Culture);
        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
