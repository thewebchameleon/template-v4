using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Users;

namespace TemplateV4.Infrastructure.Crm;

public sealed partial class CrmStore
{
    public async Task<Result<CrmRecord>> Resolve(Guid actor, Guid organisation, Guid id, bool allowArchived, CancellationToken ct)
    {
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<CrmRecord>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = await Records(organisation).AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && (allowArchived || !x.Archived) && x.Kind != "Deal", ct);
        return row is null ? Result<CrmRecord>.Fail("resource.not_found", ErrorKind.NotFound) : Result<CrmRecord>.Success(Read(row));
    }
    public async Task<Result<Page<CrmRecord>>> List(Guid actor, Guid organisation, CrmList query, CancellationToken ct)
    {
        if (!Enum.IsDefined(query.Kind) || query.Search is null or { Length: > 250 } || query.PageNumber is < 1 or > 10000 ||
            query.PageSize is < 1 or > 100 || query.Sort is not ("name" or "email" or "phone" or "value" or "outcome" or "updatedAt") || query.Direction is not ("asc" or "desc"))
            return Result<Page<CrmRecord>>.Fail("validation.failed", ErrorKind.Validation);
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<Page<CrmRecord>>.Fail("customers.not_found", ErrorKind.NotFound);
        var kind = query.Kind.ToString(); var search = query.Search.Trim().ToLowerInvariant();
        var rows = Records(organisation).AsNoTracking().Where(x => x.Kind == kind && x.Archived == query.Archived);
        if (search.Length > 0) rows = rows.Where(x => x.Name.ToLower().Contains(search) || x.Email.ToLower().Contains(search) || x.Phone.Contains(search));
        var total = await rows.CountAsync(ct); var asc = query.Direction == "asc";
        var sorted = query.Sort switch
        {
            "email" => asc ? rows.OrderBy(x => x.Email) : rows.OrderByDescending(x => x.Email),
            "phone" => asc ? rows.OrderBy(x => x.Phone) : rows.OrderByDescending(x => x.Phone),
            "value" => asc ? rows.OrderBy(x => x.Value) : rows.OrderByDescending(x => x.Value),
            "outcome" => asc ? rows.OrderBy(x => x.Outcome) : rows.OrderByDescending(x => x.Outcome),
            "updatedAt" => asc ? rows.OrderBy(x => x.UpdatedAt) : rows.OrderByDescending(x => x.UpdatedAt),
            _ => asc ? rows.OrderBy(x => x.Name) : rows.OrderByDescending(x => x.Name)
        };
        var page = await sorted.ThenBy(x => x.Id).Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize).ToArrayAsync(ct);
        return Result<Page<CrmRecord>>.Success(new(page.Select(Read).ToArray(), total, query.PageNumber, query.PageSize));
    }
    public async Task<Result<CrmDetail>> Detail(Guid actor, Guid organisation, Guid id, CancellationToken ct)
    {
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<CrmDetail>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = await Records(organisation).AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return Result<CrmDetail>.Fail("resource.not_found", ErrorKind.NotFound);
        var notes = await db.Set<CrmNoteRow>().AsNoTracking().Where(x => x.OrganisationId == organisation && x.RecordId == id)
            .OrderByDescending(x => x.At).ThenBy(x => x.Id).Select(x => new CrmNote(x.Id, x.RecordId, x.ActorId, x.Text, x.At)).ToArrayAsync(ct);
        return Result<CrmDetail>.Success(new(Read(row), notes));
    }
}
