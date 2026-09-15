using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Customers;

public sealed partial class CustomerStore
{
    private async Task<CustomerInfo?> Managed(Guid actor, Guid customer, CancellationToken ct)
    {
        if (access.Mode == "Personal" || !await Administrator(actor, ct)) return null;
        return await db.Set<CustomerRow>().Where(x => x.Id == customer && x.PersonalUserId == null && x.ClosedAt == null)
            .Select(x => new CustomerInfo(x.Id, x.Name, "Organisation", "SystemAdministrator", db.Set<MembershipRow>().Count(m => m.CustomerId == x.Id), x.Version)).SingleOrDefaultAsync(ct);
    }
    public async Task<Result<CustomerHome>> Administration(Guid actor, CancellationToken ct)
    {
        if (!await Administrator(actor, ct)) return Result<CustomerHome>.Fail("authorization.denied", ErrorKind.Forbidden);
        var accounts = access.Mode == "Personal" ? [] : await db.Set<CustomerRow>().Where(x => x.PersonalUserId == null && x.ClosedAt == null)
            .OrderBy(x => x.Name).ThenBy(x => x.Id)
            .Select(x => new CustomerInfo(x.Id, x.Name, "Organisation", "SystemAdministrator", db.Set<MembershipRow>().Count(m => m.CustomerId == x.Id), x.Version)).ToArrayAsync(ct);
        return Result<CustomerHome>.Success(new(access.Mode, accounts, []));
    }
    public async Task<Result<Unit>> Select(Guid actor, Guid organisation, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await CustomerAccess.MutationLock(db, ct);
        if (await Find(actor, organisation, ct) is not { Kind: "Organisation" }) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        await db.Users.Where(x => x.Id == actor).ExecuteUpdateAsync(x => x.SetProperty(u => u.CurrentOrganisationId, organisation), ct);
        await tx.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<CustomerHome>> Home(Guid actor, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await CustomerAccess.MutationLock(db, ct);
        var profile = await db.Profiles.AsNoTracking().SingleOrDefaultAsync(x => x.Id == actor && !x.Disabled, ct);
        if (profile is null) return Result<CustomerHome>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (access.Mode != "Organisations" && !await db.Set<CustomerRow>().AnyAsync(x => x.PersonalUserId == actor, ct))
        {
            db.Set<CustomerRow>().Add(new() { Id = actor, PersonalUserId = actor, Name = profile.DisplayName }); await db.SaveChangesAsync(ct);
        }
        var ids = await db.Set<CustomerRow>().Where(x => x.ClosedAt == null && (x.PersonalUserId == actor || db.Set<MembershipRow>().Any(m => m.CustomerId == x.Id && m.UserId == actor))).OrderBy(x => x.Name).ThenBy(x => x.Id).Select(x => x.Id).ToArrayAsync(ct);
        var accounts = new List<CustomerInfo>();
        foreach (var id in ids) if (await Find(actor, id, ct) is { } account) accounts.Add(account);
        var email = await db.Users.Where(x => x.Id == actor && x.EmailConfirmed).Select(x => x.NormalizedEmail).SingleOrDefaultAsync(ct);
        var invitations = access.Mode == "Personal" ? [] : await db.Set<CustomerInviteRow>().Where(x => x.Email == email && x.ExpiresAt > time.GetUtcNow()).OrderBy(x => x.ExpiresAt).Take(100)
            .Select(x => new CustomerInvitation(x.Id, x.CustomerId, db.Set<CustomerRow>().Where(c => c.Id == x.CustomerId).Select(c => c.Name).First(), x.Role, x.ExpiresAt)).ToArrayAsync(ct);
        var saved = await db.Users.Where(x => x.Id == actor).Select(x => x.CurrentOrganisationId).SingleAsync(ct);
        var organisations = accounts.Where(x => x.Kind == "Organisation").ToArray();
        var current = organisations.Any(x => x.Id == saved) ? saved : organisations.Length == 1 ? organisations[0].Id : (Guid?)null;
        if (current != saved) await db.Users.Where(x => x.Id == actor).ExecuteUpdateAsync(x => x.SetProperty(u => u.CurrentOrganisationId, current), ct);
        await tx.CommitAsync(ct); return Result<CustomerHome>.Success(new(access.Mode, accounts.ToArray(), invitations, current));
    }
}
