using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Contact;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;
using IExecutionContext = TemplateV4.SharedKernel.IExecutionContext;

namespace TemplateV4.Infrastructure.Contact;

public sealed class ContactStore(SupportDb db, IExecutionContext context, TimeProvider time) : IContact
{
    private bool Allowed => context.ActorId is not null && context.Permissions.Contains(Permissions.ContactManage);
    public async Task<Result<Page<ContactEnquiry>>> List(string search, int pageNumber, int pageSize, string sort, string direction, CancellationToken ct)
    {
        if (!Allowed) return Result<Page<ContactEnquiry>>.Fail("access.forbidden", ErrorKind.Forbidden);
        if (search.Length > 200 || pageNumber is < 1 or > 10000 || pageSize is not (5 or 10 or 25 or 50) || sort is not ("createdAt" or "name" or "email") || direction is not ("asc" or "desc"))
            return Result<Page<ContactEnquiry>>.Fail("validation.failed", ErrorKind.Validation);
        var rows = db.Set<ContactRow>().AsNoTracking().Where(x => x.Name.Contains(search) || x.Email.Contains(search));
        var total = await rows.CountAsync(ct);
        var ordered = (sort, direction) switch
        {
            ("name", "asc") => rows.OrderBy(x => x.Name),
            ("name", _) => rows.OrderByDescending(x => x.Name),
            ("email", "asc") => rows.OrderBy(x => x.Email),
            ("email", _) => rows.OrderByDescending(x => x.Email),
            (_, "asc") => rows.OrderBy(x => x.CreatedAt),
            _ => rows.OrderByDescending(x => x.CreatedAt)
        };
        var items = await ordered.ThenBy(x => x.Id).Skip((pageNumber - 1) * pageSize).Take(pageSize)
            .Select(x => new ContactEnquiry(x.Id, x.Name, x.Email, x.Message, x.CreatedAt, x.Read)).ToArrayAsync(ct);
        return Result<Page<ContactEnquiry>>.Success(new(items, total, pageNumber, pageSize));
    }
    public async Task<Result<Unit>> MarkRead(Guid id, CancellationToken ct)
    {
        if (!Allowed) return Result.Fail("access.forbidden", ErrorKind.Forbidden);
        var row = await db.Set<ContactRow>().SingleOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return Result.Fail("resource.not_found", ErrorKind.NotFound);
        row.Read = true;
        db.Audit.Add(new() { ActorId = context.ActorId, SubjectId = id, Action = "contact.read", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); return Result.Success();
    }
}
