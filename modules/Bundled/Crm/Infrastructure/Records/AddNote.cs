using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;

namespace TemplateV4.Infrastructure.Crm;

public sealed partial class CrmStore
{
    public async Task<Result<CrmNote>> Note(Guid actor, Guid id, AddCrmNote request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Text) || request.Text.Length > 8000) return Result<CrmNote>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Session.BeginTransactionAsync(ct); await Lock(ct);
        if (!await access.Allowed(actor, OrganisationOperation.Operate, ct) || !await Records().AnyAsync(x => x.Id == id && !x.Archived, ct))
            return Result<CrmNote>.Fail("resource.not_found", ErrorKind.NotFound);
        var note = new CrmNoteRow { RecordId = id, ActorId = actor, Text = request.Text.Trim(), At = time.GetUtcNow() };
        db.Set<CrmNoteRow>().Add(note); Audit(actor, id, "crm.note_added");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<CrmNote>.Success(new(note.Id, id, actor, note.Text, note.At));
    }
}
