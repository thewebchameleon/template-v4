using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;

namespace TemplateV4.Infrastructure.Crm;

public sealed partial class CrmStore
{
    public async Task<Result<CrmNote>> Note(Guid actor, Guid organisation, Guid id, AddCrmNote request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Text) || request.Text.Length > 8000) return Result<CrmNote>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(organisation, ct);
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Operate, ct) || !await Records(organisation).AnyAsync(x => x.Id == id && !x.Archived, ct))
            return Result<CrmNote>.Fail("resource.not_found", ErrorKind.NotFound);
        var note = new CrmNoteRow { OrganisationId = organisation, RecordId = id, ActorId = actor, Text = request.Text.Trim(), At = time.GetUtcNow() };
        db.Set<CrmNoteRow>().Add(note); Audit(actor, organisation, id, "crm.note_added");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<CrmNote>.Success(new(note.Id, id, actor, note.Text, note.At));
    }
}
