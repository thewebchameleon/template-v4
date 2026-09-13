namespace TemplateV4.Infrastructure.Storage;

/// <summary>Opaque personal identifiers or customer-scoped identifiers, shared by all providers.</summary>
public static class StorageKey
{
    public static string Validate(string key)
    {
        if (key is not null && (Guid.TryParseExact(key, "N", out _) ||
            key.Length == 65 && key[32] == '-' && Guid.TryParseExact(key[..32], "N", out _) && Guid.TryParseExact(key[33..], "N", out _))) return key;
        throw new ArgumentException("Storage keys must be opaque identifiers, optionally scoped to a customer.", nameof(key));
    }
}
