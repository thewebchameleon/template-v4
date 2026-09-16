using System.Net.Mail;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Contact;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Support;
using TemplateV4.Application.Users;
using TemplateV4.Application.Website;
using TemplateV4.Infrastructure.Persistence;
using IExecutionContext = TemplateV4.SharedKernel.IExecutionContext;

namespace TemplateV4.Infrastructure.Contact;

public sealed class ContactStore(FrameworkDb db, IExecutionContext context, ICapabilities capabilities,
    IWebsite website, ISupportModuleSettings settings, IEventOutbox outbox, IDataProtectionProvider protection, TimeProvider time, IConfiguration config) : IContact
{
    public async Task<Result<Guid>> Submit(ContactSubmission request, CancellationToken ct)
    {
        if (!await capabilities.Enabled(CapabilityIds.SupportEnquiries, ct) || !(await website.Public(ct)).Enabled || await settings.NotificationRecipient(ct) is not { } recipient)
            return Result<Guid>.Fail("resource.not_found", ErrorKind.NotFound);
        if (!string.IsNullOrEmpty(request.Website)) return Result<Guid>.Success(Guid.NewGuid());
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 120 || request.Email is not { Length: > 0 and <= 254 } ||
            !MailAddress.TryCreate(request.Email, out var address) || address.Address != request.Email ||
            string.IsNullOrWhiteSpace(request.Message) || request.Message.Length > 5000)
            return Result<Guid>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var row = new ContactRow { Name = request.Name.Trim(), Email = request.Email, Message = request.Message.Trim(), CreatedAt = time.GetUtcNow() };
        db.Add(row);
        outbox.Add(new ContactNotification(protection.CreateProtector("TemplateV4.email.recipient.v1").Protect(recipient),
            protection.CreateProtector("TemplateV4.email.action.v1").Protect(config["Web:PublicUrl"]?.TrimEnd('/') + "/administration/contact")));
        db.Audit.Add(new() { SubjectId = row.Id, Action = "contact.received", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result<Guid>.Success(row.Id);
    }
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
