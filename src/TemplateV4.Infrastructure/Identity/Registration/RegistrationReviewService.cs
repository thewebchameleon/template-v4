using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;
using TemplateV4.Application.CommercialBilling;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed record RegistrationReviewItem(Guid Id, string DisplayName, string Email);
public sealed record ReviewRegistration(Guid Id, bool Approve);
public sealed class RegistrationReviewService(FrameworkDb db, SecurityService security, IActionItems items, IEventOutbox outbox, TimeProvider time,
    ICustomerAccess customers, ICommercialEntitlements entitlements)
{
    public async Task<Result<Page<RegistrationReviewItem>>> List(int pageNumber, int pageSize, string sort, string direction, CancellationToken ct)
    {
        if (pageNumber is < 1 or > 10000 || pageSize is < 1 or > 100 || sort is not ("displayName" or "email") || direction is not ("asc" or "desc")) return Result<Page<RegistrationReviewItem>>.Fail("validation.failed", ErrorKind.Validation);
        var source = from user in db.Users.AsNoTracking() join profile in db.Profiles.AsNoTracking() on user.Id equals profile.Id where user.RegistrationState == "Pending" && user.EmailConfirmed && !profile.Disabled select new { user.Id, profile.DisplayName, Email = user.Email! };
        var total = await source.CountAsync(ct);
        var ordered = sort == "email" ? direction == "desc" ? source.OrderByDescending(x => x.Email) : source.OrderBy(x => x.Email) : direction == "desc" ? source.OrderByDescending(x => x.DisplayName) : source.OrderBy(x => x.DisplayName);
        var rows = await ordered.ThenBy(x => x.Id).Skip((pageNumber - 1) * pageSize).Take(pageSize).Select(x => new RegistrationReviewItem(x.Id, x.DisplayName, x.Email)).ToArrayAsync(ct);
        return Result<Page<RegistrationReviewItem>>.Success(new(rows, total, pageNumber, pageSize));
    }

    public async Task<Result<Unit>> Review(Guid actor, ReviewRegistration request, CancellationToken ct)
    {
        await using var tx = await db.Session.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", ct);
        await customers.Lock(ct);
        var admin = await (from membership in db.UserRoles join role in db.Roles on membership.RoleId equals role.Id join claim in db.RoleClaims on role.Id equals claim.RoleId where membership.UserId == actor && role.Name == "Administrator" && claim.ClaimType == "permission" && claim.ClaimValue == Permissions.Settings select membership).AnyAsync(ct);
        if (!admin || !await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct)) return Result.Fail("auth.forbidden", ErrorKind.Forbidden);
        await security.Lock(request.Id, ct);
        var user = await db.Users.SingleOrDefaultAsync(x => x.Id == request.Id, ct);
        if (user is null || user.RegistrationState != "Pending" || !user.EmailConfirmed || !await db.Profiles.AnyAsync(x => x.Id == user.Id && !x.Disabled, ct)) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (request.Approve && !await entitlements.CanActivateUser(user.Id, ct)) return Result.Fail("commercial-billing.seats", ErrorKind.Conflict);
        user.RegistrationState = request.Approve ? "Approved" : "Rejected";
        user.RegistrationReviewedAt = time.GetUtcNow(); user.RegistrationReviewedBy = actor;
        user.SecurityStamp = Guid.NewGuid().ToString();
        await db.Sessions.Where(x => x.UserId == user.Id && x.RevokedAt == null).ExecuteUpdateAsync(x => x.SetProperty(s => s.RevokedAt, time.GetUtcNow()), ct);
        await items.ResolveReview("Registration", user.Id, actor, ct);
        var culture = await db.Profiles.Where(x => x.Id == user.Id).Select(x => x.Culture).SingleAsync(ct);
        outbox.Add(new EmailRequest(user.Id, request.Approve ? EmailTemplate.RegistrationApproved : EmailTemplate.RegistrationRejected, culture));
        db.Audit.Add(new() { ActorId = actor, SubjectId = user.Id, Action = request.Approve ? "registration.approved" : "registration.rejected", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
