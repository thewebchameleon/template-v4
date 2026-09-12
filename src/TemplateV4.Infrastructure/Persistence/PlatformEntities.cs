namespace TemplateV4.Infrastructure.Persistence;

public sealed class UserNotification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Kind { get; set; } = "";
    public string Link { get; set; } = "/profile";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ReadAt { get; set; }
}

public sealed class StoredFile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerId { get; set; }
    public Guid? ParentId { get; set; }
    public bool IsFolder { get; set; }
    public string Name { get; set; } = "";
    public string ContentType { get; set; } = "application/octet-stream";
    public long Size { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public DateTimeOffset? PurgedAt { get; set; }
    public bool Ready { get; set; }
}

public sealed class FileStorageSettings
{
    public int Id { get; set; } = 1;
    public long DefaultQuotaBytes { get; set; } = 100L * 1024 * 1024;
    public Guid Version { get; set; } = Guid.NewGuid();
}

public sealed class DeletionRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string State { get; set; } = "Pending";
    public DateTimeOffset RequestedAt { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public Guid? ReviewedBy { get; set; }
}
