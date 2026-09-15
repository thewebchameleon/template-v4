using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Customers;

public sealed partial class CustomerStore
{
    public async Task<Result<Unit>> Invite(Guid actor, Guid customer, InviteMember request, CancellationToken ct)
    {
        if (request.Email is null or { Length: > 256 } || !MailAddress.TryCreate(request.Email, out var parsed) || parsed.Address != request.Email.Trim() || request.Role is not ("Admin" or "Member")) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        // Account provisioning shares the registration/erasure lock before organisation locks.
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", ct);
        await CustomerAccess.MutationLock(db, ct); await Lock(customer, ct);
        var info = await Managed(actor, customer, ct);
        if (info is null) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var recipient = await users.FindByEmailAsync(request.Email.Trim());
        if (recipient is null || !await db.Profiles.AnyAsync(x => x.Id == recipient.Id && !x.Disabled, ct)) return Result.Fail("customers.not_found", ErrorKind.NotFound);
        if (await db.Set<MembershipRow>().AnyAsync(x => x.CustomerId == customer && x.UserId == recipient.Id, ct)) return Result.Fail("resource.exists", ErrorKind.Conflict);
        var count = await db.Set<MembershipRow>().CountAsync(x => x.CustomerId == customer, ct);
        if (await db.Set<MembershipRow>().CountAsync(x => x.UserId == recipient.Id, ct) >= 100 || !await entitlements.CanAddMember(customer, count + 1, ct)) return Result.Fail("billing.seats", ErrorKind.Conflict);
        db.Set<MembershipRow>().Add(new() { CustomerId = customer, UserId = recipient.Id, Role = request.Role });
        await db.Set<CustomerInviteRow>().Where(x => x.CustomerId == customer && x.Email == recipient.NormalizedEmail).ExecuteDeleteAsync(ct);
        await Complete(actor, customer, "customer.member_assigned", ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<Unit>> Accept(Guid actor, Guid invitation, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await CustomerAccess.MutationLock(db, ct);
        var email = await db.Users.Where(x => x.Id == actor && x.EmailConfirmed).Select(x => x.NormalizedEmail).SingleOrDefaultAsync(ct);
        var invite = await db.Set<CustomerInviteRow>().SingleOrDefaultAsync(x => x.Id == invitation && x.Email == email && x.ExpiresAt > time.GetUtcNow(), ct);
        if (access.Mode == "Personal" || invite is null || !await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct)) return Result.Fail("customers.not_found", ErrorKind.NotFound);
        await Lock(invite.CustomerId, ct);
        if (await db.Set<MembershipRow>().AnyAsync(x => x.CustomerId == invite.CustomerId && x.UserId == actor, ct)) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        var count = await db.Set<MembershipRow>().CountAsync(x => x.CustomerId == invite.CustomerId, ct);
        if (await db.Set<MembershipRow>().CountAsync(x => x.UserId == actor, ct) >= 100 || !await entitlements.CanAddMember(invite.CustomerId, count + 1, ct)) return Result.Fail("billing.seats", ErrorKind.Conflict);
        db.Set<MembershipRow>().Add(new() { CustomerId = invite.CustomerId, UserId = actor, Role = invite.Role }); db.Set<CustomerInviteRow>().Remove(invite);
        await Complete(actor, invite.CustomerId, "customer.joined", ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<Unit>> RevokeInvitation(Guid actor, Guid customer, Guid invitation, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await CustomerAccess.MutationLock(db, ct); await Lock(customer, ct);
        if (await Managed(actor, customer, ct) is not { Kind: "Organisation" }) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        await db.Set<CustomerInviteRow>().Where(x => x.Id == invitation && x.CustomerId == customer).ExecuteDeleteAsync(ct);
        await Complete(actor, customer, "customer.invitation_revoked", ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
