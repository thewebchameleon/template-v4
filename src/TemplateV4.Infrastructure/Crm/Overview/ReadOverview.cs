using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;

namespace TemplateV4.Infrastructure.Crm;

public sealed partial class CrmStore
{
    public async Task<Result<CrmOverview>> Overview(Guid actor, Guid organisation, CancellationToken ct)
    {
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<CrmOverview>.Fail("customers.not_found", ErrorKind.NotFound);
        var deals = Records(organisation).Where(x => !x.Archived && x.Kind == "Deal" && x.Outcome == "Open");
        var recent = await Records(organisation).AsNoTracking().OrderByDescending(x => x.UpdatedAt).ThenBy(x => x.Id).Take(10).ToArrayAsync(ct);
        return Result<CrmOverview>.Success(new(await deals.CountAsync(ct), await deals.SumAsync(x => x.Value, ct), recent.Select(Read).ToArray()));
    }
}
