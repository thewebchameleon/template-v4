using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace TemplateV4.Infrastructure.Persistence;

// All contexts in one request share the core connection and one local PostgreSQL transaction.
public sealed class DatabaseSession
{
    private readonly List<(DbContext Db, Func<CancellationToken, Task<int>> Save)> contexts = [];
    private IDbContextTransaction? current;

    public void Register(DbContext db, Func<CancellationToken, Task<int>> save)
    {
        contexts.Add((db, save));
        if (current is not null) db.Database.UseTransaction(current.GetDbTransaction());
    }

    public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken ct = default)
        => BeginTransactionAsync(IsolationLevel.ReadCommitted, ct);

    public async Task<IDbContextTransaction> BeginTransactionAsync(IsolationLevel isolation, CancellationToken ct = default)
    {
        if (current is not null) throw new InvalidOperationException("A database transaction is already active.");
        current = await contexts[0].Db.Database.BeginTransactionAsync(isolation, ct);
        foreach (var entry in contexts.Skip(1)) await entry.Db.Database.UseTransactionAsync(current.GetDbTransaction(), ct);
        return new SessionTransaction(this, current);
    }

    public async Task<int> SaveChangesAsync(CancellationToken ct)
    {
        await using var owned = current is null ? await BeginTransactionAsync(ct) : null;
        var count = 0;
        // Providers can add audit/outbox records to the core context while a module is executing.
        foreach (var entry in contexts.ToArray())
            if (entry.Db.ChangeTracker.HasChanges()) count += await entry.Save(ct);
        if (owned is not null) await owned.CommitAsync(ct);
        return count;
    }

    private void Release(bool committed)
    {
        foreach (var entry in contexts)
        {
            entry.Db.Database.UseTransaction(null);
            if (!committed) entry.Db.ChangeTracker.Clear();
        }
        current = null;
    }

    private sealed class SessionTransaction(DatabaseSession session, IDbContextTransaction inner) : IDbContextTransaction
    {
        private bool committed;
        public Guid TransactionId => inner.TransactionId;
        public bool SupportsSavepoints => inner.SupportsSavepoints;
        public void Commit() { inner.Commit(); committed = true; }
        public async Task CommitAsync(CancellationToken cancellationToken = default) { await inner.CommitAsync(cancellationToken); committed = true; }
        public void Rollback() => inner.Rollback();
        public Task RollbackAsync(CancellationToken cancellationToken = default) => inner.RollbackAsync(cancellationToken);
        public void CreateSavepoint(string name) => inner.CreateSavepoint(name);
        public Task CreateSavepointAsync(string name, CancellationToken cancellationToken = default) => inner.CreateSavepointAsync(name, cancellationToken);
        public void RollbackToSavepoint(string name) => inner.RollbackToSavepoint(name);
        public Task RollbackToSavepointAsync(string name, CancellationToken cancellationToken = default) => inner.RollbackToSavepointAsync(name, cancellationToken);
        public void ReleaseSavepoint(string name) => inner.ReleaseSavepoint(name);
        public Task ReleaseSavepointAsync(string name, CancellationToken cancellationToken = default) => inner.ReleaseSavepointAsync(name, cancellationToken);
        public void Dispose() { session.Release(committed); inner.Dispose(); }
        public async ValueTask DisposeAsync() { session.Release(committed); await inner.DisposeAsync(); }
    }
}
