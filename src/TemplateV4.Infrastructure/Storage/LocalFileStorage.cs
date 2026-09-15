using Microsoft.Extensions.Configuration;

namespace TemplateV4.Infrastructure;

public sealed class LocalFileStorage(IConfiguration config) : IFileStorage
{
    private readonly string _root = Path.GetFullPath(config["Storage:Path"] ?? ".local/storage");
    private string Resolve(string key)
    {
        Storage.StorageKey.Validate(key);
        Directory.CreateDirectory(_root);
        var path = Path.Combine(_root, key);
        if (File.Exists(path) && File.GetAttributes(path).HasFlag(FileAttributes.ReparsePoint)) throw new IOException("Symbolic links are not storage objects.");
        return path;
    }
    public async Task Write(string key, Stream content, CancellationToken cancellationToken)
    {
        await using var stream = new FileStream(Resolve(key), FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, true);
        await content.CopyToAsync(stream, cancellationToken);
    }
    public Task<Stream> Read(string key, CancellationToken cancellationToken) => Task.FromResult<Stream>(File.OpenRead(Resolve(key)));
    public Task Delete(string key, CancellationToken cancellationToken) { File.Delete(Resolve(key)); return Task.CompletedTask; }
}
