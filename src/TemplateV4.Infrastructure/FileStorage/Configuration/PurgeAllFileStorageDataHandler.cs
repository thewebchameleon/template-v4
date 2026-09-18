using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.FileStorage;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;

namespace TemplateV4.Infrastructure.Storage;

public sealed class PurgeAllFileStorageDataHandler(FrameworkDb db, IExecutionContext context, FreshPasswordVerifier passwords, TimeProvider time)
    : IHandler<PurgeAllFileStorageData, Unit>
{
    public async Task<Result<Unit>> Handle(PurgeAllFileStorageData request, CancellationToken ct)
    {
        if (context.ActorId is not { } actor) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var permitted = await (from assignment in db.UserRoles
                               join claim in db.RoleClaims on assignment.RoleId equals claim.RoleId
                               where assignment.UserId == actor && claim.ClaimType == "permission" && claim.ClaimValue == Permissions.FileStoragePurge
                               select claim.Id).AnyAsync(ct);
        if (!permitted) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        if (!await passwords.Verify(actor, "file-storage-purge", request.Password, ct))
            return Result.Fail("authorization.denied", ErrorKind.Forbidden);

        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({TemplateV4.Application.Customers.Organisation.Id.ToString()}, 0))", ct);
        var now = time.GetUtcNow();
        await db.Files.Where(file => file.PurgedAt == null).ExecuteUpdateAsync(update => update
            .SetProperty(file => file.PurgeRequested, true)
            .SetProperty(file => file.DeletedAt, file => file.DeletedAt ?? now)
            .SetProperty(file => file.PurgeRetryAt, (DateTimeOffset?)null), ct);
        await db.Set<FileStorageShare>().ExecuteDeleteAsync(ct);
        db.Audit.Add(new()
        {
            ActorId = actor,
            SubjectId = TemplateV4.Application.Customers.Organisation.Id,
            SubjectType = "file-storage",
            SubjectNameSnapshot = "all-files",
            Action = "file-storage.purge_all_requested",
            At = now,
            TraceParent = context.TraceParent
        });
        return Result.Success();
    }
}
