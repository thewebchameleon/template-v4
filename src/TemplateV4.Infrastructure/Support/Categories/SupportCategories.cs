using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Support;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;

namespace TemplateV4.Infrastructure.Support;

public sealed class SupportCategoriesStore(FrameworkDb db, SupportTicketContext tickets, AccessManagementService access, IExecutionContext context, TimeProvider time) : ISupportCategories
{
    public async Task<Result<SupportOptions>> Options(string search, CancellationToken ct)
    {
        if (!await tickets.Available(ct)) return Result<SupportOptions>.Fail("support.not_found", ErrorKind.NotFound);
        if (search.Length > 120) return Result<SupportOptions>.Fail("query.invalid", ErrorKind.Validation);
        var permissions = await access.ActorPermissions(ct);
        var admin = permissions.Contains(Permissions.SupportAdmin); var agent = admin || permissions.Contains(Permissions.SupportAgent);
        var categories = await db.Set<SupportCategoryRow>().AsNoTracking().Where(x => admin || x.Active).OrderBy(x => x.Name)
            .Select(x => new SupportCategory(x.Id, x.Name, x.Active, x.Version)).ToArrayAsync(ct);
        var agents = agent ? await db.Profiles.AsNoTracking().Where(x => tickets.Agents().Contains(x.Id) && x.DisplayName.Contains(search))
            .OrderBy(x => x.DisplayName).ThenBy(x => x.Id).Take(100).Select(x => new SupportAgent(x.Id, x.DisplayName)).ToArrayAsync(ct) : [];
        return Result<SupportOptions>.Success(new(categories, agents, agent, admin));
    }
    public async Task<Result<Unit>> Category(SaveSupportCategory q, CancellationToken ct)
    {
        if (!await tickets.Available(ct)) return Result.Fail("support.not_found", ErrorKind.NotFound);
        if (!(await access.ActorPermissions(ct)).Contains(Permissions.SupportAdmin)) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842003)", ct);
        var row = q.Id == null ? new SupportCategoryRow() : await db.Set<SupportCategoryRow>().SingleOrDefaultAsync(x => x.Id == q.Id, ct);
        if (row == null) return Result.Fail("support.not_found", ErrorKind.NotFound);
        if (q.Id != null && row.Version != q.Version) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (q.Id == null && await db.Set<SupportCategoryRow>().CountAsync(ct) >= 100) return Result.Fail("support.category_limit", ErrorKind.Conflict);
        if (!q.Active && !await db.Set<SupportCategoryRow>().AnyAsync(x => x.Active && x.Id != row.Id, ct)) return Result.Fail("support.last_category", ErrorKind.Conflict);
        if (q.Id == null) db.Add(row);
        row.Name = q.Name.Trim(); row.Active = q.Active; row.Version = Guid.NewGuid();
        db.Audit.Add(new() { ActorId = context.ActorId, SubjectId = row.Id, SubjectType = "support-category", Action = "support.category_saved", At = time.GetUtcNow() });
        return Result.Success();
    }
}
