using System.Security.Claims;
using System.Threading.Channels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Npgsql;

namespace TemplateV4.ApiService;

[Authorize]
public sealed class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var actor = Context.User?.FindFirstValue("sub");
        if (Guid.TryParse(actor, out var userId))
            await Groups.AddToGroupAsync(Context.ConnectionId, NotificationChangeRelay.Group(userId));
        else
            Context.Abort();

        await base.OnConnectedAsync();
    }
}

public sealed class NotificationChangeRelay(
    IConfiguration configuration,
    IHubContext<NotificationHub> hub,
    ILogger<NotificationChangeRelay> logger) : BackgroundService
{
    private const string ChannelName = "notification_changes";
    private readonly Channel<Guid> _changes = Channel.CreateUnbounded<Guid>(new UnboundedChannelOptions
    {
        SingleReader = true,
        SingleWriter = false
    });

    internal static string Group(Guid userId) => $"notifications:{userId:N}";

    protected override Task ExecuteAsync(CancellationToken stoppingToken) =>
        Task.WhenAll(Listen(stoppingToken), Publish(stoppingToken));

    private async Task Listen(CancellationToken cancellationToken)
    {
        var connectionString = configuration.GetConnectionString("app")
            ?? throw new InvalidOperationException("ConnectionStrings:app is required.");
        var retryDelay = TimeSpan.FromSeconds(1);

        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                connection.Notification += (_, notification) =>
                {
                    if (Guid.TryParse(notification.Payload, out var userId))
                        _changes.Writer.TryWrite(userId);
                };
                await connection.OpenAsync(cancellationToken);
                await using (var command = new NpgsqlCommand($"LISTEN {ChannelName}", connection))
                    await command.ExecuteNonQueryAsync(cancellationToken);

                retryDelay = TimeSpan.FromSeconds(1);
                while (!cancellationToken.IsCancellationRequested)
                    await connection.WaitAsync(cancellationToken);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                logger.LogWarning(
                    "Notification change listener disconnected with {ErrorType}; retrying.",
                    exception.GetType().Name);
                await Task.Delay(retryDelay, cancellationToken);
                retryDelay = TimeSpan.FromSeconds(Math.Min(retryDelay.TotalSeconds * 2, 30));
            }
        }
    }

    private async Task Publish(CancellationToken cancellationToken)
    {
        await foreach (var userId in _changes.Reader.ReadAllAsync(cancellationToken))
            await hub.Clients.Group(Group(userId)).SendAsync("notificationsChanged", cancellationToken);
    }
}
