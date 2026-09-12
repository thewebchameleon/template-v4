using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Billing;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Users;
using TemplateV4.Domain.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Customers;

public sealed class CustomerAccess(FrameworkDb db, IConfiguration configuration) : ICustomerAccess
{
    public string Mode { get; } = configuration["Customers:Mode"] ?? "Both";
    public Task Lock(Guid customer, CancellationToken ct) => db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({customer.ToString()}, 0))", ct);
    public Task<Guid?> Personal(Guid actor, CancellationToken ct) => db.Set<CustomerRow>().Where(x => x.PersonalUserId == actor).Select(x => (Guid?)x.Id).SingleOrDefaultAsync(ct);
    public async Task<CustomerInfo?> Find(Guid actor, Guid customer, CancellationToken ct)
    {
        if (!await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct)) return null;
        var row = await db.Set<CustomerRow>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == customer, ct);
        if (row is null || row.PersonalUserId != null && (Mode == "Organizations" || row.PersonalUserId != actor) || row.PersonalUserId == null && Mode == "Personal") return null;
        var role = row.PersonalUserId == actor ? "Owner" : await db.Set<MembershipRow>().Where(x => x.CustomerId == customer && x.UserId == actor).Select(x => x.Role).SingleOrDefaultAsync(ct);
        return role is null ? null : new(row.Id, row.Name, row.PersonalUserId == null ? "Organization" : "Personal", role, row.PersonalUserId == null ? await db.Set<MembershipRow>().CountAsync(x => x.CustomerId == customer, ct) : 1, row.Version);
    }
    public static Task MutationLock(FrameworkDb db, CancellationToken ct) => db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842002)", ct);
}

public sealed class CustomerStore(FrameworkDb db, CustomerAccess access, IStorageEntitlements entitlements, TimeProvider time) : ICustomers
{
    public Task Lock(Guid customer, CancellationToken ct) => access.Lock(customer, ct);
    public Task<Guid?> Personal(Guid actor, CancellationToken ct) => access.Personal(actor, ct);
    public Task<CustomerInfo?> Find(Guid actor, Guid customer, CancellationToken ct) => access.Find(actor, customer, ct);
    private void Audit(Guid actor, Guid customer, string action) => db.Audit.Add(new() { ActorId = actor, SubjectId = customer, SubjectType = "customer", Action = action, At = time.GetUtcNow() });
    private async Task Complete(Guid actor, Guid customer, string action, CancellationToken ct)
    {
        await db.Set<CustomerRow>().Where(x => x.Id == customer).ExecuteUpdateAsync(x => x.SetProperty(c => c.Version, Guid.NewGuid()), ct);
        Audit(actor, customer, action); await db.SaveChangesAsync(ct);
    }
    public async Task<Result<CustomerHome>> Home(Guid actor, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await CustomerAccess.MutationLock(db, ct);
        var profile = await db.Profiles.AsNoTracking().SingleOrDefaultAsync(x => x.Id == actor && !x.Disabled, ct);
        if (profile is null) return Result<CustomerHome>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (access.Mode != "Organizations" && !await db.Set<CustomerRow>().AnyAsync(x => x.PersonalUserId == actor, ct))
        {
            db.Set<CustomerRow>().Add(new() { Id = actor, PersonalUserId = actor, Name = profile.DisplayName }); await db.SaveChangesAsync(ct);
        }
        var ids = await db.Set<CustomerRow>().Where(x => x.PersonalUserId == actor || db.Set<MembershipRow>().Any(m => m.CustomerId == x.Id && m.UserId == actor)).OrderBy(x => x.Name).ThenBy(x => x.Id).Select(x => x.Id).ToArrayAsync(ct);
        var accounts = new List<CustomerInfo>();
        foreach (var id in ids) if (await Find(actor, id, ct) is { } account) accounts.Add(account);
        var email = await db.Users.Where(x => x.Id == actor && x.EmailConfirmed).Select(x => x.NormalizedEmail).SingleOrDefaultAsync(ct);
        var invitations = access.Mode == "Personal" ? [] : await db.Set<CustomerInviteRow>().Where(x => x.Email == email && x.ExpiresAt > time.GetUtcNow()).OrderBy(x => x.ExpiresAt).Take(100)
            .Select(x => new CustomerInvitation(x.Id, x.CustomerId, db.Set<CustomerRow>().Where(c => c.Id == x.CustomerId).Select(c => c.Name).First(), x.Role, x.ExpiresAt)).ToArrayAsync(ct);
        await tx.CommitAsync(ct); return Result<CustomerHome>.Success(new(access.Mode, accounts.ToArray(), invitations));
    }
    public async Task<Result<CustomerInfo>> Create(Guid actor, CreateOrganization request, CancellationToken ct)
    {
        if (!CustomerRules.ValidName(request.Name)) return Result<CustomerInfo>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await CustomerAccess.MutationLock(db, ct);
        if (access.Mode == "Personal" || !await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct)) return Result<CustomerInfo>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (await db.Set<MembershipRow>().CountAsync(x => x.UserId == actor, ct) >= 100) return Result<CustomerInfo>.Fail("customers.limit", ErrorKind.Conflict);
        var row = new CustomerRow { Name = request.Name.Trim() }; db.Set<CustomerRow>().Add(row);
        db.Set<MembershipRow>().Add(new() { CustomerId = row.Id, UserId = actor, Role = "Owner" }); Audit(actor, row.Id, "customer.created");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<CustomerInfo>.Success(new(row.Id, row.Name, "Organization", "Owner", 1, row.Version));
    }
    public async Task<Result<Unit>> Rename(Guid actor, Guid customer, RenameOrganization request, CancellationToken ct)
    {
        if (!CustomerRules.ValidName(request.Name)) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await CustomerAccess.MutationLock(db, ct); await Lock(customer, ct);
        var info = await Find(actor, customer, ct);
        if (info is null || info.Kind != "Organization" || !CustomerRules.Manage(info.Role)) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        if (info.Version != request.Version) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        await db.Set<CustomerRow>().Where(x => x.Id == customer).ExecuteUpdateAsync(x => x.SetProperty(c => c.Name, request.Name.Trim()), ct);
        await Complete(actor, customer, "customer.renamed", ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<Page<CustomerMember>>> Members(Guid actor, Guid customer, int pageNumber, int pageSize, string sort, string direction, CancellationToken ct)
    {
        if (pageNumber is < 1 or > 10000 || pageSize is < 1 or > 100 || sort is not ("name" or "email" or "role") || direction is not ("asc" or "desc")) return Result<Page<CustomerMember>>.Fail("validation.failed", ErrorKind.Validation);
        if (await Find(actor, customer, ct) is not { Kind: "Organization" }) return Result<Page<CustomerMember>>.Fail("customers.not_found", ErrorKind.NotFound);
        var query = from member in db.Set<MembershipRow>().AsNoTracking() join profile in db.Profiles on member.UserId equals profile.Id join user in db.Users on member.UserId equals user.Id where member.CustomerId == customer select new CustomerMember(user.Id, profile.DisplayName, user.Email!, member.Role);
        var total = await query.CountAsync(ct);
        var sorted = sort switch { "email" => direction == "asc" ? query.OrderBy(x => x.Email) : query.OrderByDescending(x => x.Email), "role" => direction == "asc" ? query.OrderBy(x => x.Role) : query.OrderByDescending(x => x.Role), _ => direction == "asc" ? query.OrderBy(x => x.Name) : query.OrderByDescending(x => x.Name) };
        return Result<Page<CustomerMember>>.Success(new(await sorted.ThenBy(x => x.UserId).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToArrayAsync(ct), total, pageNumber, pageSize));
    }
    public async Task<Result<Unit>> Invite(Guid actor, Guid customer, InviteMember request, CancellationToken ct)
    {
        if (request.Email is null or { Length: > 256 } || !MailAddress.TryCreate(request.Email, out var parsed) || parsed.Address != request.Email.Trim() || request.Role is not ("Admin" or "Member")) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await CustomerAccess.MutationLock(db, ct); await Lock(customer, ct);
        var info = await Find(actor, customer, ct);
        if (info is null || info.Kind != "Organization" || !CustomerRules.Manage(info.Role) || info.Role == "Admin" && request.Role == "Admin") return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var email = request.Email.Trim().ToUpperInvariant();
        if (await db.Set<CustomerInviteRow>().CountAsync(x => x.CustomerId == customer, ct) >= 100) return Result.Fail("customers.limit", ErrorKind.Conflict);
        var invitation = await db.Set<CustomerInviteRow>().SingleOrDefaultAsync(x => x.CustomerId == customer && x.Email == email, ct);
        if (invitation is null) { invitation = new() { CustomerId = customer, Email = email }; db.Set<CustomerInviteRow>().Add(invitation); }
        invitation.Role = request.Role; invitation.ExpiresAt = time.GetUtcNow().AddDays(7);
        var recipient = await db.Users.Where(x => x.NormalizedEmail == email).Select(x => (Guid?)x.Id).SingleOrDefaultAsync(ct);
        if (recipient != null) db.Notifications.Add(new() { UserId = recipient.Value, Kind = "notificationOrganization", Link = "/organizations", CreatedAt = time.GetUtcNow() });
        await Complete(actor, customer, "customer.invited", ct); await tx.CommitAsync(ct); return Result.Success();
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
        if (await Find(actor, customer, ct) is not { Role: "Owner" or "Admin", Kind: "Organization" }) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        await db.Set<CustomerInviteRow>().Where(x => x.Id == invitation && x.CustomerId == customer).ExecuteDeleteAsync(ct);
        await Complete(actor, customer, "customer.invitation_revoked", ct); await tx.CommitAsync(ct); return Result.Success();
    }
    public Task<Result<Unit>> Member(Guid actor, Guid customer, ChangeMember request, CancellationToken ct) => Change(actor, customer, request.UserId, request.Role, request.Version, false, ct);
    public Task<Result<Unit>> Remove(Guid actor, Guid customer, Guid user, Guid version, CancellationToken ct) => Change(actor, customer, user, null, version, false, ct);
    public Task<Result<Unit>> Transfer(Guid actor, Guid customer, Guid user, Guid version, CancellationToken ct) => Change(actor, customer, user, "Owner", version, true, ct);
    private async Task<Result<Unit>> Change(Guid actor, Guid customer, Guid user, string? role, Guid version, bool transfer, CancellationToken ct)
    {
        if (role != null && !CustomerRules.Role(role) || role == "Owner" && !transfer) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await CustomerAccess.MutationLock(db, ct); await Lock(customer, ct);
        var info = await Find(actor, customer, ct);
        if (info is null || info.Kind != "Organization") return Result.Fail("customers.not_found", ErrorKind.NotFound);
        if (info.Version != version) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        var member = await db.Set<MembershipRow>().SingleOrDefaultAsync(x => x.CustomerId == customer && x.UserId == user, ct);
        if (member is null) return Result.Fail("customers.not_found", ErrorKind.NotFound);
        if (transfer)
        {
            if (info.Role != "Owner" || actor == user || !await db.Profiles.AnyAsync(x => x.Id == user && !x.Disabled, ct)) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
            var owner = await db.Set<MembershipRow>().SingleAsync(x => x.CustomerId == customer && x.UserId == actor, ct); owner.Role = "Admin"; member.Role = "Owner";
        }
        else
        {
            if (member.Role == "Owner") return Result.Fail("customers.last_owner", ErrorKind.Conflict);
            if (!(actor == user && role == null) && (info.Role != "Owner" && (info.Role != "Admin" || member.Role != "Member" || role == "Admin"))) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
            if (role == null) db.Set<MembershipRow>().Remove(member); else member.Role = role;
        }
        await Complete(actor, customer, transfer ? "customer.ownership_transferred" : role == null ? "customer.member_removed" : "customer.role_changed", ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
