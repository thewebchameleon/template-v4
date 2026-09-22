using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.FileStorage;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed class FileReferences(FrameworkDb db, TimeProvider time) : IFileReferences
{
    private IQueryable<StoredFile> AvailableFiles => db.Files.Where(x => x.Ready && !x.IsFolder && x.DeletedAt == null && x.PurgedAt == null && !x.PurgeRequested);
    public async Task<bool> Available(Guid actor, Guid id, bool imageOnly, CancellationToken ct) =>
        await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct) &&
        await db.Users.AnyAsync(x => x.Id == actor && x.EmailConfirmed && (x.RegistrationState == "Approved" || x.RegistrationState == "NotRequired"), ct) &&
        await AvailableFiles.AnyAsync(x => x.Id == id && (!imageOnly || x.ContentType.StartsWith("image/")), ct);
    public async Task<bool> Public(Guid id, CancellationToken ct) =>
        await AvailableFiles.AnyAsync(x => x.Id == id, ct) &&
        await db.Set<FileStorageShare>().AnyAsync(x => x.FileId == id && x.RecipientId == null && x.RecipientEmail == null && x.TokenHash != null && x.RevokedAt == null && (x.ExpiresAt == null || x.ExpiresAt > time.GetUtcNow()), ct);
}
