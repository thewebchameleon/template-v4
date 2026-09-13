using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace TemplateV4.Infrastructure.Storage;

public sealed class S3FileStorage : IFileStorage, IDisposable
{
    private readonly AmazonS3Client _client;
    private readonly string _bucket;
    public S3FileStorage(IConfiguration config, IHostEnvironment environment)
    {
        var endpoint = new Uri(config["Storage:S3:Endpoint"] ?? throw new InvalidOperationException("Storage:S3:Endpoint is required."));
        if (endpoint.Scheme != "https" && !environment.IsDevelopment() && !environment.IsEnvironment("Testing"))
            throw new InvalidOperationException("Production object storage requires HTTPS.");
        _bucket = config["Storage:S3:Bucket"] ?? throw new InvalidOperationException("Storage:S3:Bucket is required.");
        _client = new AmazonS3Client(new BasicAWSCredentials(
            config["Storage:S3:AccessKey"] ?? throw new InvalidOperationException("Storage:S3:AccessKey is required."),
            config["Storage:S3:SecretKey"] ?? throw new InvalidOperationException("Storage:S3:SecretKey is required.")), new AmazonS3Config
            {
                ServiceURL = endpoint.AbsoluteUri,
                ForcePathStyle = true,
                AuthenticationRegion = config["Storage:S3:Region"] ?? "us-east-1",
                Timeout = TimeSpan.FromSeconds(60),
                MaxErrorRetry = 0,
                RequestChecksumCalculation = RequestChecksumCalculation.WHEN_REQUIRED,
                ResponseChecksumValidation = ResponseChecksumValidation.WHEN_REQUIRED
            });
    }
    private static string Key(string key) => StorageKey.Validate(key);
    public async Task Write(string key, Stream content, CancellationToken cancellationToken) =>
        await _client.PutObjectAsync(new PutObjectRequest { BucketName = _bucket, Key = Key(key), InputStream = content, AutoCloseStream = false, ContentType = "application/octet-stream", IfNoneMatch = "*" }, cancellationToken);
    public async Task<Stream> Read(string key, CancellationToken cancellationToken)
    {
        var response = await _client.GetObjectAsync(_bucket, Key(key), cancellationToken);
        return new ObjectStream(response);
    }
    public async Task Delete(string key, CancellationToken cancellationToken) => await _client.DeleteObjectAsync(_bucket, Key(key), cancellationToken);
    public void Dispose() => _client.Dispose();

    private sealed class ObjectStream(GetObjectResponse response) : Stream
    {
        public override bool CanRead => true;
        public override bool CanSeek => false;
        public override bool CanWrite => false;
        public override long Length => response.ContentLength;
        public override long Position { get => throw new NotSupportedException(); set => throw new NotSupportedException(); }
        public override int Read(byte[] buffer, int offset, int count) => response.ResponseStream.Read(buffer, offset, count);
        public override ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default) => response.ResponseStream.ReadAsync(buffer, cancellationToken);
        public override void Flush() => throw new NotSupportedException();
        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();
        public override void SetLength(long value) => throw new NotSupportedException();
        public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();
        protected override void Dispose(bool disposing) { if (disposing) response.Dispose(); base.Dispose(disposing); }
    }
}
