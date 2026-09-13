using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;
using TemplateV4.Domain.Users;

namespace TemplateV4.Infrastructure.Persistence;

public sealed class UnitOfWork(FrameworkDb db, IEnumerable<IDomainEventHandler> handlers, IExecutionContext context, TimeProvider time) : IUnitOfWork
{
    public async Task<Result<T>> Execute<T>(Func<Task<Result<T>>> action, string? key, string fingerprint, CancellationToken cancellationToken)
    {
        if (key is { Length: > 100 } or "") return Result<T>.Fail("idempotency.invalid", ErrorKind.Validation);
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var scopedKey = key is null ? null : $"{context.ActorId}:{key}";
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(fingerprint)));
        try
        {
            if (scopedKey is not null)
            {
                // Serialize replay/response creation with account erasure.
                await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842001)", cancellationToken);
                await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({scopedKey}, 0))", cancellationToken);
                var existing = await db.Idempotency.FindAsync([scopedKey], cancellationToken);
                if (existing is not null && existing.ExpiresAt > time.GetUtcNow())
                    return existing.Erased ? Result<T>.Fail("idempotency.erased", ErrorKind.Conflict) : existing.Fingerprint == hash ? JsonSerializer.Deserialize<Result<T>>(existing.Response)!
                        : Result<T>.Fail("idempotency.conflict", ErrorKind.Conflict);
                if (existing is not null) db.Idempotency.Remove(existing);
            }
            var result = await action();
            if (!result.IsSuccess) { await transaction.RollbackAsync(cancellationToken); db.ChangeTracker.Clear(); return result; }
            var aggregates = db.ChangeTracker.Entries().Select(x => x.Entity).OfType<IDomainEventSource>().ToArray();
            foreach (var aggregate in aggregates)
            {
                foreach (var domainEvent in aggregate.Events)
                {
                    var registered = handlers.Where(handler => handler.Handles(domainEvent)).ToArray();
                    if (registered.Length == 0) throw new InvalidOperationException("Unregistered domain event handler.");
                    foreach (var handler in registered) handler.Handle(domainEvent);
                }
            }
            if (scopedKey is not null)
            {
                // Delete an expired key before replacing it in the identity map.
                await db.SaveChangesAsync(cancellationToken);
                db.Idempotency.Add(new() { Key = scopedKey, ActorId = context.ActorId, SubjectId = result.Value is TemplateV4.Application.Users.UserDto subject ? subject.Id : null, Fingerprint = hash, Response = JsonSerializer.Serialize(result), ExpiresAt = time.GetUtcNow().AddHours(24) });
            }
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            foreach (var aggregate in aggregates) aggregate.ClearEvents();
            return result;
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync(cancellationToken); db.ChangeTracker.Clear();
            return Result<T>.Fail("concurrency.conflict", ErrorKind.Conflict);
        }
        catch (DbUpdateException exception) when (exception.InnerException is Npgsql.PostgresException { SqlState: "23505" })
        {
            await transaction.RollbackAsync(cancellationToken); db.ChangeTracker.Clear();
            return Result<T>.Fail("resource.exists", ErrorKind.Conflict);
        }
        catch { db.ChangeTracker.Clear(); throw; }
    }
}
