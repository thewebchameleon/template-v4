using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class FileStorageService
{
    public async Task<Result<FileShareItem[]>> Shares(Guid actor, Guid id, CancellationToken ct)
    {
        if (!await CanWrite(actor, ct) || !await db.Files.AnyAsync(x => x.Id == id && x.DeletedAt == null && x.Ready, ct)) return Result<FileShareItem[]>.Fail("files.not_found", ErrorKind.NotFound);
        return Result<FileShareItem[]>.Success(await db.Set<FileStorageShare>().Where(x => x.FileId == id).OrderByDescending(x => x.CreatedAt).Select(x => new FileShareItem(x.Id, x.RecipientEmail ?? db.Users.Where(u => u.Id == x.RecipientId).Select(u => u.Email).FirstOrDefault(), x.Permission, x.ExpiresAt, null)).ToArrayAsync(ct));
    }
    public async Task<Result<FileShareItem>> Share(Guid actor, Guid id, FileShareRequest request, CancellationToken ct)
    {
        var email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        if (request.Permission is not ("viewer" or "editor") || request.ExpiresAt <= time.GetUtcNow() || email is { Length: > 254 } || email is not null && !new EmailAddressAttribute().IsValid(email) || email is null && request.Permission != "viewer") return Result<FileShareItem>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(actor, ct);
        if (!await CanWrite(actor, ct) || !await db.Files.AnyAsync(x => x.Id == id && x.Ready && x.DeletedAt == null, ct)) return Result<FileShareItem>.Fail("files.not_found", ErrorKind.NotFound);
        Guid? recipient = null;
        if (email is not null)
        {
            var normalizedEmail = email.ToUpperInvariant();
            recipient = await db.Users.Where(x => x.NormalizedEmail == normalizedEmail && db.Profiles.Any(p => p.Id == x.Id && !p.Disabled)).Select(x => (Guid?)x.Id).SingleOrDefaultAsync(ct);
        }
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var row = new FileStorageShare { FileId = id, SharedById = actor, RecipientId = recipient, RecipientEmail = email, Permission = request.Permission, ExpiresAt = request.ExpiresAt?.ToUniversalTime(), CreatedAt = time.GetUtcNow(), TokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))) };
        db.Add(row);
        if (email is not null)
        {
            var culture = await db.Profiles.Where(x => x.Id == actor).Select(x => x.Culture).SingleAsync(ct);
            shareNotifier?.Queue(email, culture, id, token);
        }
        Audit(actor, id, "shared"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<FileShareItem>.Success(new(row.Id, email, row.Permission, row.ExpiresAt, token));
    }
    public async Task<Result<Unit>> Revoke(Guid actor, Guid id, Guid shareId, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(actor, ct);
        if (!await CanWrite(actor, ct) || !await db.Files.AnyAsync(x => x.Id == id, ct)) return Result.Fail("files.not_found", ErrorKind.NotFound);
        await db.Set<FileStorageShare>().Where(x => x.FileId == id && x.Id == shareId).ExecuteDeleteAsync(ct);
        Audit(actor, id, "share_revoked"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
