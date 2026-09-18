namespace TemplateV4.Infrastructure.ApiKeys;

public sealed class ApiKeyRow
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public byte[] SecretHash { get; set; } = [];
    public string[] Scopes { get; set; } = [];
    public Guid CreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public DateTimeOffset? LastUsedAt { get; set; }
    public long RequestCount { get; set; }
}
