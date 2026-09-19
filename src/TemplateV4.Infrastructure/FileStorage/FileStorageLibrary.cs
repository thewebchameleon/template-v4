using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class FileStorageService
{
    public static string Category(string name) => Path.GetExtension(name).ToLowerInvariant() switch
    {
        ".png" or ".jpg" or ".jpeg" or ".gif" or ".webp" or ".svg" or ".avif" or ".bmp" or ".heic" or ".tiff" => "images",
        ".pdf" or ".doc" or ".docx" or ".odt" or ".txt" or ".rtf" or ".md" => "documents",
        ".xls" or ".xlsx" or ".csv" or ".ods" or ".tsv" => "spreadsheets",
        ".ppt" or ".pptx" or ".odp" => "presentations",
        ".mp4" or ".mov" or ".webm" or ".mkv" or ".avi" => "video",
        ".mp3" or ".wav" or ".ogg" or ".flac" or ".m4a" or ".aac" => "audio",
        ".zip" or ".7z" or ".rar" or ".tar" or ".gz" => "archives",
        _ => "other"
    };
    private static HashSet<Guid> Descendants(IEnumerable<StoredFile> files, Guid id)
    {
        var children = files.ToLookup(x => x.ParentId);
        var ids = new HashSet<Guid> { id }; var queue = new Queue<Guid>(); queue.Enqueue(id);
        while (queue.TryDequeue(out var parent)) foreach (var child in children[parent]) if (ids.Add(child.Id)) queue.Enqueue(child.Id);
        return ids;
    }
    private async Task<string?> Permission(Guid actor, StoredFile file, CancellationToken ct, string? token = null)
    {
        if (token is null) return !await Active(actor, ct) ? null : await CanWrite(actor, ct) ? "owner" : "viewer";
        var ancestors = new HashSet<Guid> { file.Id }; var parent = file.ParentId;
        while (parent is { } id && ancestors.Add(id))
        {
            var row = await db.Files.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.Ready && x.DeletedAt == null && !x.PurgeRequested, ct);
            if (row is null) return null;
            parent = row.ParentId;
        }
        var now = time.GetUtcNow();
        var shares = db.Set<FileStorageShare>().Where(x => ancestors.Contains(x.FileId) && (x.ExpiresAt == null || x.ExpiresAt > now));
        if (token != null)
        {
            if (token.Length != 64) return null;
            var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
            return await shares.AnyAsync(x => x.TokenHash == hash, ct) ? "viewer" : null;
        }
        return null;
    }
    private async Task<StoredFile?> Access(Guid actor, Guid id, bool edit, CancellationToken ct, string? token = null)
    {
        var file = await db.Files.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.Ready && x.DeletedAt == null && x.PurgedAt == null && !x.PurgeRequested, ct);
        if (file is null) return null;
        var permission = await Permission(actor, file, ct, token);
        return permission != null && (!edit || permission is "owner" or "editor") ? file : null;
    }
    private void Audit(Guid actor, Guid id, string action) => db.Audit.Add(new() { ActorId = actor, SubjectId = id, Action = "file." + action, At = time.GetUtcNow() });
}

public sealed record FileUsageSegment(string Category, long Bytes, int Count);

public sealed record FileMetadataRequest(bool Important, bool Starred);

public sealed record FileMoveRequest(Guid? ParentId);

public sealed record FileSelectionRequest(Guid[] Ids);

public sealed record FileBatchDestinationRequest(Guid[] Ids, Guid? ParentId);

public sealed record FileShareRequest(string? Email, string Permission, DateTimeOffset? ExpiresAt);

public sealed record FileShareItem(Guid Id, string? Recipient, string Permission, DateTimeOffset? ExpiresAt, string? Token = null);
