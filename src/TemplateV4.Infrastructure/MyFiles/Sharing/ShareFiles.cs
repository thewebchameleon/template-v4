using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class MyFilesService
{
    public async Task<Result<FileShareItem[]>> Shares(Guid actor, Guid id, CancellationToken ct)
    {
        if (!await CanWrite(actor, ct) || !await db.Files.AnyAsync(x => x.Id == id && x.DeletedAt == null && x.Ready, ct)) return Result<FileShareItem[]>.Fail("files.not_found", ErrorKind.NotFound);
        return Result<FileShareItem[]>.Success(await db.Set<MyFileShare>().Where(x => x.FileId == id).OrderByDescending(x => x.CreatedAt).Select(x => new FileShareItem(x.Id, db.Users.Where(u => u.Id == x.RecipientId).Select(u => u.Email).FirstOrDefault(), x.Permission, x.ExpiresAt, null)).ToArrayAsync(ct));
    }
    public async Task<Result<FileShareItem>> Share(Guid actor, Guid id, FileShareRequest request, CancellationToken ct)
    {
        if (request.Permission is not ("viewer" or "editor") || request.ExpiresAt <= time.GetUtcNow() || request.Email is { Length: > 256 } || string.IsNullOrWhiteSpace(request.Email) && request.Permission != "viewer") return Result<FileShareItem>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(actor, ct);
        if (!await CanWrite(actor, ct) || !await db.Files.AnyAsync(x => x.Id == id && x.Ready && x.DeletedAt == null, ct)) return Result<FileShareItem>.Fail("files.not_found", ErrorKind.NotFound);
        Guid? recipient = null; string? token = null;
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var email = request.Email.Trim().ToUpperInvariant();
            recipient = await db.Users.Where(x => x.NormalizedEmail == email && db.Profiles.Any(p => p.Id == x.Id && !p.Disabled)).Select(x => (Guid?)x.Id).SingleOrDefaultAsync(ct);
            if (recipient == null || recipient == actor) return Result<FileShareItem>.Fail("files.recipient_invalid", ErrorKind.Validation);
        }
        else token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var row = new MyFileShare { FileId = id, RecipientId = recipient, Permission = request.Permission, ExpiresAt = request.ExpiresAt?.ToUniversalTime(), CreatedAt = time.GetUtcNow(), TokenHash = token is null ? null : Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))) };
        db.Add(row); Audit(actor, id, "shared"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<FileShareItem>.Success(new(row.Id, request.Email, row.Permission, row.ExpiresAt, token));
    }
    public async Task<Result<Unit>> Revoke(Guid actor, Guid id, Guid shareId, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(actor, ct);
        if (!await CanWrite(actor, ct) || !await db.Files.AnyAsync(x => x.Id == id, ct)) return Result.Fail("files.not_found", ErrorKind.NotFound);
        await db.Set<MyFileShare>().Where(x => x.FileId == id && x.Id == shareId).ExecuteDeleteAsync(ct);
        Audit(actor, id, "share_revoked"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
