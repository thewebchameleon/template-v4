using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;

namespace TemplateV4.Infrastructure.Crm;

public sealed partial class CrmStore
{
    public async Task<Result<CrmRecord>> Archive(Guid actor, Guid organisation, Guid id, ArchiveCrmRecord request, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(organisation, ct);
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Operate, ct)) return Result<CrmRecord>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = await Records(organisation).SingleOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return Result<CrmRecord>.Fail("resource.not_found", ErrorKind.NotFound);
        if (row.Version != request.Version) return Result<CrmRecord>.Fail("concurrency.conflict", ErrorKind.Conflict);
        row.Archived = request.Archived; row.Version = Guid.NewGuid(); row.UpdatedAt = time.GetUtcNow();
        Audit(actor, organisation, id, request.Archived ? "crm.archived" : "crm.restored");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<CrmRecord>.Success(Read(row));
    }
}
