using TemplateV4.Application.Customers;
using TemplateV4.Application.Users;
using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Customers;

public sealed partial class CustomerStore
{
    public async Task<Result<Page<OrganisationUser>>> Users(Guid actor, int pageNumber, int pageSize, CancellationToken ct)
    {
        if (pageNumber is < 1 or > 10000 || pageSize is < 1 or > 100) return Result<Page<OrganisationUser>>.Fail("validation.failed", ErrorKind.Validation);
        if (await Find(actor, ct) is null) return Result<Page<OrganisationUser>>.Fail("authorization.denied", ErrorKind.Forbidden);
        var query = db.Profiles.AsNoTracking().Where(x => !x.Disabled);
        var count = await query.CountAsync(ct);
        var items = await query.OrderBy(x => x.DisplayName).ThenBy(x => x.Id).Skip((pageNumber - 1) * pageSize).Take(pageSize)
            .Select(x => new OrganisationUser(x.Id, x.DisplayName)).ToArrayAsync(ct);
        return Result<Page<OrganisationUser>>.Success(new(items, count, pageNumber, pageSize));
    }
    private async Task<CustomerInfo?> Managed(Guid actor, CancellationToken ct) =>
        await Find(actor, ct) is { CanManage: true } info ? info : null;
    public async Task<Result<CustomerInfo>> Home(Guid actor, CancellationToken ct) =>
        await Find(actor, ct) is { } info
            ? Result<CustomerInfo>.Success(info)
            : Result<CustomerInfo>.Fail("authorization.denied", ErrorKind.Forbidden);
}
