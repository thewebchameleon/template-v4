using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.BackgroundWorker;

public sealed class OutboxPump(IServiceScopeFactory scopes, ILogger<OutboxPump> logger) : BackgroundService
{
    public static readonly ActivitySource ActivitySource = new("TemplateV4.Messaging");
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (!await Process(stoppingToken)) await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception exception)
            {
                logger.LogError("Outbox iteration failed: {ErrorType}", exception.GetType().Name);
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }
    public async Task<bool> Process(CancellationToken ct)
    {
        await using var scope = scopes.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
        var time = scope.ServiceProvider.GetRequiredService<TimeProvider>();
        var now = time.GetUtcNow();
        OutboxMessage? message;
        var lease = Guid.NewGuid();
        await using (var claim = await db.Database.BeginTransactionAsync(ct))
        {
            message = await db.Outbox.FromSqlInterpolated($"SELECT * FROM messaging.outbox WHERE \"CompletedAt\" IS NULL AND \"PoisonedAt\" IS NULL AND \"AvailableAt\" <= {now} AND (\"LeaseUntil\" IS NULL OR \"LeaseUntil\" < {now}) ORDER BY \"CreatedAt\" LIMIT 1 FOR UPDATE SKIP LOCKED").FirstOrDefaultAsync(ct);
            if (message is null) return false;
            message.LeaseId = lease; message.LeaseUntil = now.AddMinutes(2);
            await db.SaveChangesAsync(ct); await claim.CommitAsync(ct);
        }
        ActivityContext.TryParse(message.TraceParent, null, out var parent);
        using var activity = ActivitySource.StartActivity(message.Type, ActivityKind.Consumer, parent);
        var context = scope.ServiceProvider.GetRequiredService<BackgroundExecutionContext>();
        context.ActorId = message.ActorId; context.Culture = message.Culture; context.TraceParent = activity?.Id;
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct); timeout.CancelAfter(TimeSpan.FromSeconds(30));
        try
        {
            // SMTP is outside a database transaction. Local effects and receipts remain atomic.
            await using var local = message.Type == "email.requested.v1" ? null : await db.Database.BeginTransactionAsync(ct);
            await scope.ServiceProvider.GetRequiredService<IIntegrationTransport>().Publish(new(message.Id, message.Type, message.Payload, message.Culture, message.TraceParent, message.ActorId), timeout.Token);
            await using var externalCompletion = local is null ? await db.Database.BeginTransactionAsync(ct) : null;
            var owned = await db.Outbox.Where(x => x.Id == message.Id && x.LeaseId == lease && x.LeaseUntil > time.GetUtcNow()).AnyAsync(ct);
            if (!owned) throw new InvalidOperationException("Delivery lease expired.");
            message.CompletedAt = time.GetUtcNow();
            message.LeaseId = null; message.LeaseUntil = null;
            await db.SaveChangesAsync(ct);
            await (local ?? externalCompletion!).CommitAsync(ct);
        }
        catch (Exception exception) when (!ct.IsCancellationRequested)
        {
            db.ChangeTracker.Clear();
            // Reacquire the row; another replica may have completed it since rollback.
            await using var retryTx = await db.Database.BeginTransactionAsync(ct);
            var failed = await db.Outbox.FromSqlInterpolated($"SELECT * FROM messaging.outbox WHERE \"Id\" = {message.Id} FOR UPDATE").SingleAsync(ct);
            if (failed.CompletedAt is null && failed.LeaseId == lease)
            {
                failed.Attempts++; failed.LastErrorCode = exception.GetType().Name;
                failed.LeaseId = null; failed.LeaseUntil = null;
                failed.AvailableAt = time.GetUtcNow().AddSeconds(Math.Min(3600, Math.Pow(2, failed.Attempts) * 5) + Random.Shared.Next(1, 10));
                if (failed.Attempts >= 8) failed.PoisonedAt = time.GetUtcNow();
                await db.SaveChangesAsync(ct);
            }
            await retryTx.CommitAsync(ct);
            logger.LogWarning("Message {MessageId} delivery failed with {ErrorType}", message.Id, exception.GetType().Name);
        }
        return true;
    }
}
