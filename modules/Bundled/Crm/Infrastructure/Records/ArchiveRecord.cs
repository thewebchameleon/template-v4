using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;

namespace TemplateV4.Infrastructure.Crm;

public sealed partial class CrmStore
{
    public async Task<Result<CrmRecord>> Archive(Guid actor, Guid id, ArchiveCrmRecord request, CancellationToken ct)
    {
        await using var tx = await db.Session.BeginTransactionAsync(ct); await Lock(ct);
        if (!await access.Allowed(actor, OrganisationOperation.Operate, ct)) return Result<CrmRecord>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = await Records().SingleOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return Result<CrmRecord>.Fail("resource.not_found", ErrorKind.NotFound);
        if (row.Version != request.Version) return Result<CrmRecord>.Fail("concurrency.conflict", ErrorKind.Conflict);
        row.Archived = request.Archived; row.Version = Guid.NewGuid(); row.UpdatedAt = time.GetUtcNow();
        Audit(actor, id, request.Archived ? "crm.archived" : "crm.restored");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<CrmRecord>.Success(Read(row));
    }
}
