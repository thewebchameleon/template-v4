using System.Net;
using System.Net.Sockets;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using TemplateV4.ApiService;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class DiscoveredProxyHeadersTests
{
    [Theory]
    [InlineData("172.30.0.10", true)]
    [InlineData("::ffff:172.30.0.10", true)]
    [InlineData("172.30.0.11", false)]
    [InlineData("127.0.0.1", false)]
    public async Task Only_discovered_proxy_can_forward_one_hop(string remote, bool trusted)
    {
        var middleware = new DiscoveredProxyHeaders(_ => Task.CompletedTask, "web", NullLoggerFactory.Instance,
            (_, _) => Task.FromResult(new[] { IPAddress.Parse("172.30.0.10") }));
        var context = Request(remote);
        await middleware.Invoke(context);
        Assert.Equal(trusted ? "https" : "http", context.Request.Scheme);
        Assert.Equal(trusted ? "203.0.113.8" : remote, context.Connection.RemoteIpAddress!.ToString());
    }

    [Fact]
    public async Task Discovery_recovers_from_startup_failure_replaces_addresses_and_revokes_stale_trust()
    {
        var clock = new Clock();
        IPAddress[]? addresses = null;
        var calls = 0;
        var middleware = new DiscoveredProxyHeaders(_ => Task.CompletedTask, "web", NullLoggerFactory.Instance,
            (_, _) => { calls++; return addresses is null ? Task.FromException<IPAddress[]>(new SocketException()) : Task.FromResult(addresses); }, clock);
        var health = new DefaultHttpContext();
        await middleware.Invoke(health);
        Assert.Equal(0, calls);
        await Check("172.30.0.10", false);
        addresses = [IPAddress.Parse("172.30.0.10")];
        await Check("172.30.0.10", false);
        Assert.Equal(1, calls);
        clock.Advance();
        await Check("172.30.0.10", true);
        addresses = [IPAddress.Parse("172.30.0.20")];
        clock.Advance();
        await Check("172.30.0.10", false);
        await Check("172.30.0.20", true);
        addresses = null;
        clock.Advance();
        await Check("172.30.0.20", false);
        addresses = [];
        clock.Advance();
        await Check("172.30.0.20", false);

        async Task Check(string remote, bool trusted)
        {
            var context = Request(remote);
            await middleware.Invoke(context);
            Assert.Equal(trusted ? "https" : "http", context.Request.Scheme);
        }
    }

    [Fact]
    public async Task Literal_address_remains_supported_without_dns()
    {
        var middleware = new DiscoveredProxyHeaders(_ => Task.CompletedTask, "172.30.0.10", NullLoggerFactory.Instance,
            (_, _) => throw new InvalidOperationException("Literal addresses must not use DNS."));
        var context = Request("172.30.0.10");
        await middleware.Invoke(context);
        Assert.Equal("https", context.Request.Scheme);
    }

    private static DefaultHttpContext Request(string remote)
    {
        var context = new DefaultHttpContext();
        context.Request.Scheme = "http";
        context.Connection.RemoteIpAddress = IPAddress.Parse(remote);
        context.Request.Headers["X-Forwarded-For"] = "198.51.100.99, 203.0.113.8";
        context.Request.Headers["X-Forwarded-Proto"] = "http, https";
        return context;
    }

    private sealed class Clock : TimeProvider
    {
        private DateTimeOffset now = DateTimeOffset.UtcNow;
        public override DateTimeOffset GetUtcNow() => now;
        public void Advance() => now = now.AddSeconds(11);
    }
}
