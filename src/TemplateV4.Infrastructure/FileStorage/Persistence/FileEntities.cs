
namespace TemplateV4.Infrastructure.Persistence;

public sealed class StoredFile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? OwnerId { get; set; }
    public string? StorageKey { get; set; }
    public string ObjectKey => StorageKey ?? Id.ToString("N");
    public Guid? ParentId { get; set; }
    public bool IsFolder { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Tags { get; set; } = "";
    public bool Important { get; set; }
    public bool Starred { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public Guid? TrashBatchId { get; set; }
    public bool PurgeRequested { get; set; }
    public string ContentType { get; set; } = "application/octet-stream";
    public long Size { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public DateTimeOffset? PurgedAt { get; set; }
    public DateTimeOffset? PurgeRetryAt { get; set; }
    public bool Ready { get; set; }
}
public sealed class FileStorageSettings
{
    public int Id { get; set; } = 1;
    public long DefaultQuotaBytes { get; set; } = 100L * 1024 * 1024;
    public long MaxUploadBytes { get; set; } = 20L * 1024 * 1024;
    public bool DemoMode { get; set; }
    public bool SlowUploadMode { get; set; }
    public int DemoExpiryMinutes { get; set; } = 60;
    public DateTimeOffset? DemoStartedAt { get; set; }
    public Guid Version { get; set; } = Guid.NewGuid();
}
public sealed class FileStorageShare
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FileId { get; set; }
    public Guid? SharedById { get; set; }
    public Guid? RecipientId { get; set; }
    public string? RecipientEmail { get; set; }
    public string? TokenHash { get; set; }
    public string? ProtectedToken { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
