using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using Microsoft.AspNetCore.Builder;
using TemplateV4.Infrastructure.Storage;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class S3StorageTests : IAsyncLifetime
{
    private readonly IContainer _storage = new ContainerBuilder("chrislusf/seaweedfs:4.45")
        .WithCommand("mini", "-dir=/data", "-bucket=templatev4")
        .WithEnvironment("AWS_ACCESS_KEY_ID", "integration-key")
        .WithEnvironment("AWS_SECRET_ACCESS_KEY", "integration-secret")
        .WithPortBinding(8333, true)
        .WithWaitStrategy(Wait.ForUnixContainer().UntilExternalTcpPortIsAvailable(8333)).Build();
    public Task InitializeAsync() => _storage.StartAsync();
    public async Task DisposeAsync() => await _storage.DisposeAsync();
    [Fact]
    public async Task S3_roundtrip_conditional_create_and_repeated_delete_work_with_SeaweedFS()
    {
        var endpoint = $"http://{_storage.Hostname}:{_storage.GetMappedPublicPort(8333)}";
        using var client = new AmazonS3Client(new BasicAWSCredentials("integration-key", "integration-secret"), new AmazonS3Config { ServiceURL = endpoint, ForcePathStyle = true, AuthenticationRegion = "us-east-1" });
        using var ready = new CancellationTokenSource(TimeSpan.FromSeconds(45));
        while (true)
        {
            try { await client.ListObjectsV2Async(new() { BucketName = "templatev4", MaxKeys = 1 }, ready.Token); break; }
            catch (AmazonS3Exception) when (!ready.IsCancellationRequested) { await Task.Delay(500, ready.Token); }
        }
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = "Testing" });
        builder.Configuration["Storage:S3:Endpoint"] = endpoint; builder.Configuration["Storage:S3:Bucket"] = "templatev4";
        builder.Configuration["Storage:S3:AccessKey"] = "integration-key"; builder.Configuration["Storage:S3:SecretKey"] = "integration-secret";
        using var provider = new S3FileStorage(builder.Configuration, builder.Environment);
        var key = Guid.NewGuid().ToString("N"); using var content = new MemoryStream("stored in SeaweedFS"u8.ToArray());
        await provider.Write(key, content, default);
        await using (var stream = await provider.Read(key, default))
        using (var reader = new StreamReader(stream)) Assert.Equal("stored in SeaweedFS", await reader.ReadToEndAsync());
        content.Position = 0;
        await Assert.ThrowsAsync<AmazonS3Exception>(() => provider.Write(key, content, default));
        await provider.Delete(key, default); await provider.Delete(key, default);
        await Assert.ThrowsAsync<NoSuchKeyException>(() => provider.Read(key, default));
    }
}
