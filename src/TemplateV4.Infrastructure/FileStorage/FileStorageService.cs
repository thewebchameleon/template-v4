using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.FileStorage;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class FileStorageService(FrameworkDb db, IFileStorage storage, TimeProvider time, IStorageCapacity capacity)
{
    public const long DefaultMaxUploadBytes = 20L * 1024 * 1024;
    public const long MinimumUploadBytes = 5L * 1024 * 1024;
    public const long MaximumUploadBytes = 1000L * 1024 * 1024;
    public const long MinimumDefaultQuotaBytes = 50L * 1024 * 1024;
    public const long MaximumDefaultQuotaBytes = 20000L * 1024 * 1024;
    public const long MaximumQuotaBytes = 100L * 1024 * 1024 * 1024;
    private static bool ValidName(string? name) => !string.IsNullOrWhiteSpace(name) && name.Length <= 180 && name.Trim() is not ("." or "..") && !name.Any(c => char.IsControl(c) || c is '/' or '\\');
    private static FileItem Item(StoredFile file) => new(file.Id, file.Name, file.ContentType, file.Size, file.CreatedAt, file.IsFolder, file.ParentId, file.UpdatedAt ?? file.CreatedAt, file.Description, file.Tags, file.Important, file.Starred, "owner", Category(file.Name));
    private async Task Lock(Guid? owner, CancellationToken ct)
    {
        await TemplateV4.Infrastructure.Customers.CustomerAccess.MutationLock(db, ct);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({TemplateV4.Application.Customers.Organisation.Id.ToString()}, 0))", ct);
    }
    private Task<bool> FolderExists(Guid owner, Guid? parent, CancellationToken ct) => parent is null ? Task.FromResult(true) : db.Files.AnyAsync(x => x.Id == parent && x.IsFolder && x.Ready && x.DeletedAt == null, ct);
    private Task<bool> Active(Guid owner, CancellationToken ct) => db.Profiles.AnyAsync(x => x.Id == owner && !x.Disabled && db.Users.Any(u => u.Id == owner && u.EmailConfirmed && (u.RegistrationState == "Approved" || u.RegistrationState == "NotRequired")), ct);
    private async Task<bool> CanWrite(Guid actor, CancellationToken ct) => await Active(actor, ct) && await (from assignment in db.UserRoles
                                                                                                             join claim in db.RoleClaims on assignment.RoleId equals claim.RoleId
                                                                                                             where assignment.UserId == actor && claim.ClaimType == "permission" && claim.ClaimValue == Permissions.SharedFilesManage
                                                                                                             select claim).AnyAsync(ct);
}

public sealed record FileItem(Guid Id, string Name, string ContentType, long Size, DateTimeOffset CreatedAt, bool IsFolder, Guid? ParentId, DateTimeOffset? UpdatedAt = null, string Description = "", string Tags = "", bool Important = false, bool Starred = false, string Permission = "owner", string Category = "other", int ItemCount = 0, int FileCount = 0, bool DemoMode = false, int DemoExpiryMinutes = 60);

public sealed record FilePage(Page<FileItem> Page, long UsedBytes, long QuotaBytes, long MaxUploadBytes, FileItem? Folder, long? QuotaOverrideBytes, string OwnerName, FileItem[] Recent, FileItem[] Folders, FileUsageSegment[] Usage, int FileCount = 0, bool DemoMode = false, int DemoExpiryMinutes = 60, bool SlowUploadMode = false);

public sealed record FileDownload(Stream Content, string Name);

public sealed record FileNameRequest(string Name);

public sealed record CreateFolderRequest(string Name, Guid? ParentId = null);

public sealed record StorageSettingsRequest(long DefaultQuotaBytes, long MaxUploadBytes, Guid Version, int DemoExpiryMinutes = 60);
