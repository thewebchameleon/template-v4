using System.Net;
using System.Net.Sockets;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Options;

[assembly: System.Runtime.CompilerServices.InternalsVisibleTo("TemplateV4.Application.Tests")]

namespace TemplateV4.ApiService;

// Each refresh replaces the whole middleware so concurrent requests never see a mutated trust list.
internal sealed class DiscoveredProxyHeaders(
    RequestDelegate next,
    string proxy,
    ILoggerFactory loggerFactory,
    Func<string, CancellationToken, Task<IPAddress[]>>? resolve = null,
    TimeProvider? clock = null)
{
    private readonly SemaphoreSlim refresh = new(1, 1);
    private readonly TimeProvider time = clock ?? TimeProvider.System;
    private readonly Func<string, CancellationToken, Task<IPAddress[]>> lookup = resolve ?? Dns.GetHostAddressesAsync;
    private readonly ILogger logger = loggerFactory.CreateLogger<DiscoveredProxyHeaders>();
    private Snapshot? snapshot;

    public async Task Invoke(HttpContext context)
    {
        // Health probes and direct requests need no DNS, including before Web has started.
        if (!context.Request.Headers.ContainsKey("X-Forwarded-For") && !context.Request.Headers.ContainsKey("X-Forwarded-Proto"))
        {
            await next(context);
            return;
        }

        var current = Volatile.Read(ref snapshot);
        if (current is null || current.Expires <= time.GetUtcNow())
        {
            await refresh.WaitAsync(context.RequestAborted);
            try
            {
                current = snapshot;
                if (current is null || current.Expires <= time.GetUtcNow())
                {
                    IPAddress[] addresses = [];
                    if (IPAddress.TryParse(proxy, out var address)) addresses = [address];
                    else
                    {
                        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(context.RequestAborted);
                        timeout.CancelAfter(TimeSpan.FromSeconds(2));
                        try { addresses = await lookup(proxy, timeout.Token); }
                        catch (Exception exception) when (exception is SocketException || exception is OperationCanceledException && !context.RequestAborted.IsCancellationRequested)
                        {
                            logger.LogWarning("Trusted proxy DNS lookup failed; forwarded headers will be ignored until the next refresh.");
                        }
                    }

                    ForwardedHeadersMiddleware? middleware = null;
                    if (addresses.Length > 0)
                    {
                        var options = new ForwardedHeadersOptions
                        {
                            ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
                            ForwardLimit = 1
                        };
                        options.KnownProxies.Clear();
                        options.KnownIPNetworks.Clear();
                        foreach (var known in addresses) options.KnownProxies.Add(known);
                        middleware = new(next, loggerFactory, Options.Create(options));
                    }
                    // An empty result must bypass forwarding, never create an unrestricted trust list.
                    current = new(time.GetUtcNow().AddSeconds(10), middleware);
                    Volatile.Write(ref snapshot, current);
                }
            }
            finally { refresh.Release(); }
        }

        if (current.Middleware is { } forwarded) await forwarded.Invoke(context);
        else await next(context);
    }

    private sealed record Snapshot(DateTimeOffset Expires, ForwardedHeadersMiddleware? Middleware);
}
