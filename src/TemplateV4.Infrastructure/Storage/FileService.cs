using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed record FileItem(Guid Id, string Name, string ContentType, long Size, DateTimeOffset CreatedAt);
public sealed record FilePage(Page<FileItem> Page, long UsedBytes, long QuotaBytes, long MaxUploadBytes, string[] AllowedExtensions);
public sealed record FileDownload(Stream Content, string Name);
public sealed class FileService(FrameworkDb db, IFileStorage storage, IConfiguration config, TimeProvider time)
{
    public const long MaxUploadBytes = 20 * 1024 * 1024;
    public static readonly string[] AllowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".txt", ".csv"];
    private long Quota => Math.Clamp(config.GetValue<long>("Storage:QuotaBytes", 1024L * 1024 * 1024), MaxUploadBytes, 100L * 1024 * 1024 * 1024);
    public async Task<Result<FilePage>> List(Guid actor, int pageNumber, int pageSize, string? search, string sort, string direction, CancellationToken ct)
    {
        if (pageNumber is < 1 or > 10000 || pageSize is < 1 or > 100 || search is { Length: > 120 } || sort is not ("name" or "size" or "createdAt") || direction is not ("asc" or "desc")) return Result<FilePage>.Fail("validation.failed", ErrorKind.Validation);
        var all = db.Files.AsNoTracking().Where(x => x.OwnerId == actor && x.Ready && x.DeletedAt == null);
        var used = await db.Files.Where(x => x.OwnerId == actor && x.PurgedAt == null).SumAsync(x => x.Size, ct);
        if (!string.IsNullOrWhiteSpace(search)) all = all.Where(x => x.Name.Contains(search));
        var total = await all.CountAsync(ct);
        var descending = direction == "desc";
        var ordered = sort switch
        {
            "name" when descending => all.OrderByDescending(x => x.Name).ThenByDescending(x => x.Id),
            "name" => all.OrderBy(x => x.Name).ThenBy(x => x.Id),
            "size" when descending => all.OrderByDescending(x => x.Size).ThenByDescending(x => x.Id),
            "size" => all.OrderBy(x => x.Size).ThenBy(x => x.Id),
            _ when descending => all.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id),
            _ => all.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id)
        };
        var items = await ordered.Skip((pageNumber - 1) * pageSize).Take(pageSize).Select(x => new FileItem(x.Id, x.Name, x.ContentType, x.Size, x.CreatedAt)).ToArrayAsync(ct);
        return Result<FilePage>.Success(new(new(items, total, pageNumber, pageSize), used, Quota, MaxUploadBytes, AllowedExtensions));
    }
    public async Task<Result<FileItem>> Upload(Guid actor, string name, Stream input, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Length > 180 || name.Any(c => char.IsControl(c) || c is '/' or '\\') || !AllowedExtensions.Contains(Path.GetExtension(name).ToLowerInvariant()))
            return Result<FileItem>.Fail("files.invalid_type", ErrorKind.Validation);
        using var content = new MemoryStream();
        var buffer = new byte[81920];
        int read;
        while ((read = await input.ReadAsync(buffer, ct)) > 0)
        {
            if (content.Length + read > MaxUploadBytes) return Result<FileItem>.Fail("files.too_large", ErrorKind.Validation);
            await content.WriteAsync(buffer.AsMemory(0, read), ct);
        }
        if (content.Length == 0) return Result<FileItem>.Fail("files.empty", ErrorKind.Validation);
        var extension = Path.GetExtension(name).ToLowerInvariant();
        var bytes = content.GetBuffer();
        var signature = extension switch
        {
            ".pdf" => content.Length >= 5 && bytes.AsSpan(0, 5).SequenceEqual("%PDF-"u8),
            ".png" => content.Length >= 8 && bytes.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }),
            ".jpg" or ".jpeg" => content.Length >= 3 && bytes[0] == 255 && bytes[1] == 216 && bytes[2] == 255,
            _ => !bytes.AsSpan(0, (int)content.Length).Contains((byte)0)
        };
        if (!signature) return Result<FileItem>.Fail("files.invalid_type", ErrorKind.Validation);
        var file = new StoredFile { OwnerId = actor, Name = name.Trim(), Size = content.Length, CreatedAt = time.GetUtcNow(), ContentType = extension switch { ".pdf" => "application/pdf", ".png" => "image/png", ".jpg" or ".jpeg" => "image/jpeg", ".csv" => "text/csv", _ => "text/plain" } };
        await using (var reserve = await db.Database.BeginTransactionAsync(ct))
        {
            await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({actor.ToString()}, 0))", ct);
            if (!await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct)) return Result<FileItem>.Fail("authorization.denied", ErrorKind.Forbidden);
            var used = await db.Files.Where(x => x.OwnerId == actor && x.PurgedAt == null).SumAsync(x => x.Size, ct);
            if (used + file.Size > Quota) return Result<FileItem>.Fail("files.quota", ErrorKind.Conflict);
            db.Files.Add(file); await db.SaveChangesAsync(ct); await reserve.CommitAsync(ct);
        }
        // Durable reservations allow maintenance to reconcile uploads interrupted between storage and DB.
        content.Position = 0;
        await storage.Write(file.Id.ToString("N"), content, ct);
        await using var finish = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({actor.ToString()}, 0))", ct);
        await db.Entry(file).ReloadAsync(ct);
        if (file.DeletedAt != null || !await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct)) return Result<FileItem>.Fail("authorization.denied", ErrorKind.Forbidden);
        file.Ready = true;
        db.Audit.Add(new() { ActorId = actor, SubjectId = file.Id, Action = "file.uploaded", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await finish.CommitAsync(ct);
        return Result<FileItem>.Success(new(file.Id, file.Name, file.ContentType, file.Size, file.CreatedAt));
    }
    public async Task<Result<FileDownload>> Download(Guid actor, Guid id, CancellationToken ct)
    {
        var file = await db.Files.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.OwnerId == actor && x.Ready && x.DeletedAt == null, ct);
        if (file is null) return Result<FileDownload>.Fail("files.not_found", ErrorKind.NotFound);
        return Result<FileDownload>.Success(new(await storage.Read(id.ToString("N"), ct), file.Name));
    }
    public async Task<Result<Unit>> Delete(Guid actor, Guid id, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var changed = await db.Files.Where(x => x.Id == id && x.OwnerId == actor && x.DeletedAt == null).ExecuteUpdateAsync(x => x.SetProperty(f => f.DeletedAt, time.GetUtcNow()), ct);
        if (changed == 0) return Result.Fail("files.not_found", ErrorKind.NotFound);
        db.Audit.Add(new() { ActorId = actor, SubjectId = id, Action = "file.deleted", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
