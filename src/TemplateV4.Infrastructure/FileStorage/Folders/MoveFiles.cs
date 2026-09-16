using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class FileStorageService
{
    public async Task<Result<Unit>> Move(Guid actor, Guid id, FileMoveRequest request, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(actor, ct);
        if (!await CanWrite(actor, ct)) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var entries = await db.Files.AsNoTracking().Where(x => x.DeletedAt == null && x.PurgedAt == null).ToArrayAsync(ct);
        var file = entries.SingleOrDefault(x => x.Id == id && x.Ready);
        if (file is null || !await FolderExists(actor, request.ParentId, ct)) return Result.Fail("files.not_found", ErrorKind.NotFound);
        if (request.ParentId is { } parent && Descendants(entries, id).Contains(parent)) return Result.Fail("files.invalid_move", ErrorKind.Validation);
        var siblingNames = entries.Where(x => x.Id != id && x.ParentId == request.ParentId && x.Ready).Select(x => x.Name);
        var name = UniqueMoveName(file.Name, file.IsFolder, siblingNames);
        await db.Files.Where(x => x.Id == id).ExecuteUpdateAsync(s => s.SetProperty(x => x.ParentId, request.ParentId).SetProperty(x => x.Name, name).SetProperty(x => x.UpdatedAt, time.GetUtcNow()), ct);
        Audit(actor, id, "moved"); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }

    private static string UniqueMoveName(string name, bool isFolder, IEnumerable<string> siblingNames)
    {
        var used = siblingNames.ToHashSet(StringComparer.OrdinalIgnoreCase);
        if (!used.Contains(name)) return name;
        var extension = isFolder ? "" : Path.GetExtension(name);
        var stem = extension.Length == name.Length ? name : name[..^extension.Length];
        for (var index = 1; ; index++)
        {
            var suffix = $" ({index})";
            var maximumStemLength = 180 - suffix.Length - extension.Length;
            var candidate = stem[..Math.Min(stem.Length, Math.Max(0, maximumStemLength))] + suffix + extension;
            if (!used.Contains(candidate)) return candidate;
        }
    }
}
