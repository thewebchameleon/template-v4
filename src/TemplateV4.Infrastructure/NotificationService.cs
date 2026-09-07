using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure;

public sealed record NotificationItem(Guid Id, string Kind, string Link, DateTimeOffset CreatedAt, DateTimeOffset? ReadAt);
public sealed record NotificationPage(Page<NotificationItem> Page, int Unread, bool OptionalEmailEnabled);
public sealed record NotificationPreference(bool OptionalEmailEnabled);
public sealed record NotificationSummary(int Unread);
public sealed class NotificationService(FrameworkDb db, TimeProvider time)
{
    public async Task<NotificationSummary> Summary(Guid actor, CancellationToken ct) => new(await db.Notifications.CountAsync(x => x.UserId == actor && x.ReadAt == null, ct));
    public async Task<Result<NotificationPage>> List(Guid actor, int pageNumber, bool unreadOnly, CancellationToken ct)
    {
        if (pageNumber is < 1 or > 10000) return Result<NotificationPage>.Fail("validation.failed", ErrorKind.Validation);
        var source = db.Notifications.AsNoTracking().Where(x => x.UserId == actor);
        var unread = await source.CountAsync(x => x.ReadAt == null, ct);
        if (unreadOnly) source = source.Where(x => x.ReadAt == null);
        var total = unreadOnly ? unread : await source.CountAsync(ct);
        var items = await source.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id).Skip((pageNumber - 1) * 25).Take(25)
            .Select(x => new NotificationItem(x.Id, x.Kind, x.Link, x.CreatedAt, x.ReadAt)).ToArrayAsync(ct);
        var enabled = await db.Users.Where(x => x.Id == actor).Select(x => x.OptionalEmailEnabled).SingleAsync(ct);
        return Result<NotificationPage>.Success(new(new(items, total, pageNumber, 25), unread, enabled));
    }
    public async Task<Result<Unit>> Read(Guid actor, Guid? id, CancellationToken ct)
    {
        var query = db.Notifications.Where(x => x.UserId == actor && x.ReadAt == null);
        if (id is not null) query = query.Where(x => x.Id == id);
        await query.ExecuteUpdateAsync(x => x.SetProperty(n => n.ReadAt, time.GetUtcNow()), ct);
        return Result.Success();
    }
    public async Task<Result<Unit>> Preferences(Guid actor, NotificationPreference request, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Users.Where(x => x.Id == actor).ExecuteUpdateAsync(x => x.SetProperty(u => u.OptionalEmailEnabled, request.OptionalEmailEnabled), ct);
        db.Audit.Add(new() { ActorId = actor, SubjectId = actor, Action = "notifications.preferences_changed", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
