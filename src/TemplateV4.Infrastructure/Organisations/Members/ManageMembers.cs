using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Users;
using TemplateV4.Domain.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Customers;

public sealed partial class CustomerStore
{
    public async Task<Result<Page<CustomerMember>>> Members(Guid actor, Guid customer, int pageNumber, int pageSize, string sort, string direction, CancellationToken ct)
    {
        if (pageNumber is < 1 or > 10000 || pageSize is < 1 or > 100 || sort is not ("name" or "email" or "role") || direction is not ("asc" or "desc")) return Result<Page<CustomerMember>>.Fail("validation.failed", ErrorKind.Validation);
        if (await Managed(actor, customer, ct) is not { Kind: "Organisation" }) return Result<Page<CustomerMember>>.Fail("customers.not_found", ErrorKind.NotFound);
        var query = from member in db.Set<MembershipRow>().AsNoTracking() join profile in db.Profiles on member.UserId equals profile.Id join user in db.Users on member.UserId equals user.Id where member.CustomerId == customer select new { UserId = user.Id, Name = profile.DisplayName, Email = user.Email!, member.Role };
        var total = await query.CountAsync(ct);
        var sorted = sort switch { "email" => direction == "asc" ? query.OrderBy(x => x.Email) : query.OrderByDescending(x => x.Email), "role" => direction == "asc" ? query.OrderBy(x => x.Role) : query.OrderByDescending(x => x.Role), _ => direction == "asc" ? query.OrderBy(x => x.Name) : query.OrderByDescending(x => x.Name) };
        var items = await sorted.ThenBy(x => x.UserId).Skip((pageNumber - 1) * pageSize).Take(pageSize).Select(x => new CustomerMember(x.UserId, x.Name, x.Email, x.Role)).ToArrayAsync(ct);
        return Result<Page<CustomerMember>>.Success(new(items, total, pageNumber, pageSize));
    }
    public Task<Result<Unit>> Member(Guid actor, Guid customer, ChangeMember request, CancellationToken ct) => Change(actor, customer, request.UserId, request.Role, request.Version, false, ct);
    public Task<Result<Unit>> Remove(Guid actor, Guid customer, Guid user, Guid version, CancellationToken ct) => Change(actor, customer, user, null, version, false, ct);
    public Task<Result<Unit>> Transfer(Guid actor, Guid customer, Guid user, Guid version, CancellationToken ct) => Change(actor, customer, user, "Owner", version, true, ct);
    private async Task<Result<Unit>> Change(Guid actor, Guid customer, Guid user, string? role, Guid version, bool transfer, CancellationToken ct)
    {
        if (role != null && !CustomerRules.Role(role) || role == "Owner" && !transfer) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await CustomerAccess.MutationLock(db, ct); await Lock(customer, ct);
        var info = await Managed(actor, customer, ct);
        if (info is null || info.Kind != "Organisation") return Result.Fail("customers.not_found", ErrorKind.NotFound);
        if (info.Version != version) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        var member = await db.Set<MembershipRow>().SingleOrDefaultAsync(x => x.CustomerId == customer && x.UserId == user, ct);
        if (member is null) return Result.Fail("customers.not_found", ErrorKind.NotFound);
        if (transfer)
        {
            if (member.Role == "Owner" || !await db.Profiles.AnyAsync(x => x.Id == user && !x.Disabled, ct)) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
            await db.Set<MembershipRow>().Where(x => x.CustomerId == customer && x.Role == "Owner").ExecuteUpdateAsync(x => x.SetProperty(m => m.Role, "Admin"), ct); member.Role = "Owner";
        }
        else
        {
            if (member.Role == "Owner") return Result.Fail("customers.last_owner", ErrorKind.Conflict);
            if (role == null)
            {
                db.Set<MembershipRow>().Remove(member);
                await db.Users.Where(x => x.Id == user && x.CurrentOrganisationId == customer).ExecuteUpdateAsync(x => x.SetProperty(u => u.CurrentOrganisationId, (Guid?)null), ct);
            }
            else member.Role = role;
        }
        await Complete(actor, customer, transfer ? "customer.ownership_transferred" : role == null ? "customer.member_removed" : "customer.role_changed", ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
