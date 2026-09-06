using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;
using TemplateV4.Domain.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed record RegistrationRequest(string Email, string DisplayName, string Password, string Culture);
public sealed record RegistrationSettings(bool Enabled);

public sealed class RegistrationService(FrameworkDb db, UserManager<AppUser> users, AccountService accounts, CultureCatalog cultures, TimeProvider time)
{
    public async Task<RegistrationSettings> Settings(CancellationToken ct) => new(await db.SecuritySettings.AnyAsync(x => x.RegistrationEnabled, ct));

    public async Task<Result<Unit>> Register(RegistrationRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || request.Email.Length > 254 || !new EmailAddressAttribute().IsValid(request.Email.Trim()) ||
            string.IsNullOrWhiteSpace(request.DisplayName) || request.DisplayName.Trim().Length > 120 ||
            string.IsNullOrWhiteSpace(request.Password) || request.Password.Length > 1024 || !cultures.Supported.Contains(request.Culture))
            return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        // Serialize with policy changes so disabling registration takes effect atomically.
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", ct);
        if (!(await Settings(ct)).Enabled) return Result.Fail("auth.registration_disabled", ErrorKind.Forbidden);
        var email = request.Email.Trim();
        var candidate = new AppUser { Id = Guid.NewGuid(), Email = email, UserName = email };
        foreach (var validator in users.PasswordValidators)
        {
            var validation = await validator.ValidateAsync(users, candidate, request.Password);
            if (!validation.Succeeded) return Result<Unit>.Fail("validation.failed", ErrorKind.Validation, new() { ["password"] = validation.Errors.Select(x => x.Description).ToArray() });
        }
        if (await users.FindByEmailAsync(email) is not null || await users.FindByNameAsync(email) is not null)
            return Result.Success();
        var user = candidate;
        var created = await users.CreateAsync(user, request.Password);
        if (!created.Succeeded)
            return Result<Unit>.Fail("validation.failed", ErrorKind.Validation, new() { ["password"] = created.Errors.Select(x => x.Description).ToArray() });
        if (!(await users.AddToRoleAsync(user, "Reader")).Succeeded) throw new InvalidOperationException("Seeded role assignment failed.");
        var profile = UserProfile.Create(user.Id, request.DisplayName, request.Culture, invitationRequired: false);
        db.Profiles.Add(profile);
        db.Audit.Add(new() { SubjectId = user.Id, Action = "auth.registered", At = time.GetUtcNow() });
        await accounts.QueueAction(user, EmailTemplate.Verification, profile.Culture, ct);
        await tx.CommitAsync(ct);
        return Result.Success();
    }
}
