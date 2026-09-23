using TemplateV4.Application;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class AccountService
{
    public static bool ValidUsername(string? username) =>
        username is { Length: >= 3 and <= 64 } &&
        username.All(character => char.IsAsciiLetterOrDigit(character) || character is '-' or '_' or '.');

    public async Task<Result<string>> ChangeUsername(Guid actor, Guid sessionId, ChangeUsernameRequest request, CancellationToken ct)
    {
        var username = request.Username?.Trim();
        if (!ValidUsername(username)) return Result<string>.Fail("profile.username_invalid", ErrorKind.Validation);
        if (!await limiter.Allow("change-username", actor.ToString(), 1, TimeSpan.FromMinutes(2), ct))
            return Result<string>.Fail("invitation.wait", ErrorKind.Conflict);

        await using var tx = await db.Session.BeginTransactionAsync(ct);
        var user = (await users.FindByIdAsync(actor.ToString()))!;
        if (!await security.Proof(user, request.Proof, ct))
        {
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
            return Result<string>.Fail("auth.factor_invalid", ErrorKind.Forbidden);
        }
        if (string.Equals(user.UserName, username, StringComparison.OrdinalIgnoreCase))
            return Result<string>.Fail("profile.same_username", ErrorKind.Validation);
        if (await users.FindByNameAsync(username!) is not null)
            return Result<string>.Fail("profile.username_unavailable", ErrorKind.Conflict);
        if (!(await users.SetUserNameAsync(user, username)).Succeeded)
            return Result<string>.Fail("profile.username_unavailable", ErrorKind.Conflict);

        await security.Changed(user, sessionId, "account.username_changed", ct);
        await tx.CommitAsync(ct);
        return Result<string>.Success(username!);
    }
}

public sealed record ChangeUsernameRequest(string Username, SecurityProof Proof);
