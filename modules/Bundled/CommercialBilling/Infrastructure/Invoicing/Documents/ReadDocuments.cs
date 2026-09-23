using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Invoicing;
using TemplateV4.Application.Users;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed partial class InvoicingStore
{
    public async Task<Result<CommercialDocument[]>> ForOrigin(Guid actor, CommercialOrigin origin, CancellationToken ct)
    {
        if (!await access.Allowed(actor, OrganisationOperation.Read, ct)) return Result<CommercialDocument[]>.Fail("customers.not_found", ErrorKind.NotFound);
        var rows = await Documents().AsNoTracking().Where(x => x.OriginModule == origin.Module && x.OriginType == origin.Type && x.OriginId == origin.Id).OrderByDescending(x => x.IssuedAt).ThenBy(x => x.Id).ToArrayAsync(ct);
        return Result<CommercialDocument[]>.Success(rows.Select(Read).ToArray());
    }
    public async Task<Result<CommercialDocument>> ByOrigin(Guid actor, CommercialOrigin origin, CancellationToken ct)
    {
        if (!await access.Allowed(actor, OrganisationOperation.Read, ct)) return Result<CommercialDocument>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = await Documents().AsNoTracking().SingleOrDefaultAsync(x => x.Kind == "Invoice" && x.OriginModule == origin.Module && x.OriginType == origin.Type && x.OriginId == origin.Id, ct);
        return row is null ? Result<CommercialDocument>.Fail("resource.not_found", ErrorKind.NotFound) : Result<CommercialDocument>.Success(Read(row));
    }
    public async Task<Result<Page<CommercialDocument>>> List(Guid actor, int page, int size, string search, string sort, string direction, string group, CancellationToken ct)
    {
        if (page is < 1 or > 10000 || size is < 1 or > 100 || search is null or { Length: > 250 } || sort is not ("number" or "customer" or "kind" or "total" or "issuedAt") || direction is not ("asc" or "desc") || group is not ("" or "quotes" or "invoices")) return Result<Page<CommercialDocument>>.Fail("validation.failed", ErrorKind.Validation);
        if (!await access.Allowed(actor, OrganisationOperation.Read, ct)) return Result<Page<CommercialDocument>>.Fail("customers.not_found", ErrorKind.NotFound);
        var term = search.Trim().ToLowerInvariant(); var rows = Documents().AsNoTracking().Where(x => x.Number.ToLower().Contains(term) || x.CustomerName.ToLower().Contains(term));
        if (group == "quotes") rows = rows.Where(x => x.Kind == "Quotation");
        if (group == "invoices") rows = rows.Where(x => x.Kind != "Quotation");
        var total = await rows.CountAsync(ct); var asc = direction == "asc";
        var ordered = sort switch
        {
            "number" => asc ? rows.OrderBy(x => x.Number) : rows.OrderByDescending(x => x.Number),
            "customer" => asc ? rows.OrderBy(x => x.CustomerName) : rows.OrderByDescending(x => x.CustomerName),
            "kind" => asc ? rows.OrderBy(x => x.Kind) : rows.OrderByDescending(x => x.Kind),
            "total" => asc ? rows.OrderBy(x => x.Total) : rows.OrderByDescending(x => x.Total),
            _ => asc ? rows.OrderBy(x => x.IssuedAt) : rows.OrderByDescending(x => x.IssuedAt)
        };
        var items = await ordered.ThenBy(x => x.Id).Skip((page - 1) * size).Take(size).ToArrayAsync(ct);
        return Result<Page<CommercialDocument>>.Success(new(items.Select(Read).ToArray(), total, page, size));
    }
}
