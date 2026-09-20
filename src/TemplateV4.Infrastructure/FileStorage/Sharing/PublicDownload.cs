using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class FileStorageService
{
    public async Task<Result<PublicFileShare>> PublicItem(Guid id, string token, CancellationToken ct)
    {
        if (token.Length != 64) return Result<PublicFileShare>.Fail("files.not_found", ErrorKind.NotFound);
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
        var share = await db.Set<FileStorageShare>().AsNoTracking()
            .Where(x => x.FileId == id && x.TokenHash == hash)
            .Select(x => new
            {
                x.SharedById,
                x.ExpiresAt,
                x.RevokedAt,
                DisplayName = db.Profiles.Where(profile => profile.Id == x.SharedById).Select(profile => profile.DisplayName).FirstOrDefault(),
                Email = db.Users.Where(user => user.Id == x.SharedById).Select(user => user.Email).FirstOrDefault()
            })
            .SingleOrDefaultAsync(ct);
        if (share is null || share.RevokedAt == null && share.ExpiresAt <= time.GetUtcNow())
            return Result<PublicFileShare>.Fail("files.not_found", ErrorKind.NotFound);
        var file = await db.Files.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.Ready && x.DeletedAt == null && x.PurgedAt == null && !x.PurgeRequested, ct);
        if (file is null) return Result<PublicFileShare>.Fail("files.not_found", ErrorKind.NotFound);
        var settings = await Settings(ct);
        var item = Item(file) with { Permission = "viewer", DemoMode = settings.DemoMode, DemoExpiryMinutes = settings.DemoExpiryMinutes };
        return Result<PublicFileShare>.Success(new(item, share.DisplayName, share.Email, share.RevokedAt != null));
    }
    public async Task<Result<FileDownload>> PublicDownload(Guid id, string token, CancellationToken ct)
    {
        var file = await Access(Guid.Empty, id, false, ct, token);
        return file is null || file.IsFolder ? Result<FileDownload>.Fail("files.not_found", ErrorKind.NotFound) : Result<FileDownload>.Success(new(await storage.Read(file.ObjectKey, ct), file.Name));
    }
}
