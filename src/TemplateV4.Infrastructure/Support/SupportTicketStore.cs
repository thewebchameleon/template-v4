using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Support;
using TemplateV4.Application.Users;
using TemplateV4.Domain.Support;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;

namespace TemplateV4.Infrastructure.Support;

public sealed class SupportTicketStore(FrameworkDb db, IExecutionContext context, TimeProvider time,
    AccessManagementService access, IRuntimeModules modules, IEventOutbox outbox,
    IDataProtectionProvider protection, IConfiguration config) : ISupportTickets
{
    private async Task<bool> Available(CancellationToken ct)
    {
        if (context.ActorId is not { } actor) return false;
        // Match account erasure's actor lock before accepting new personally identifying content.
        if (db.Database.CurrentTransaction != null)
            await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({actor.ToString()}, 0))", ct);
        return await modules.Enabled("support", ct) && await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct);
    }
    private async Task<bool> Agent(CancellationToken ct) => (await access.ActorPermissions(ct)).Any(p => p is Permissions.SupportAgent or Permissions.SupportAdmin);
    private IQueryable<SupportTicketRow> Visible(bool agent) => db.Set<SupportTicketRow>().Where(x => agent || x.RequesterId == context.ActorId);
    private IQueryable<TicketItem> Items(IQueryable<SupportTicketRow> source) => source.Select(x => new TicketItem(x.Id, x.Subject, x.RequesterId,
        db.Profiles.Where(p => p.Id == x.RequesterId).Select(p => p.DisplayName).FirstOrDefault() ?? "",
        x.CategoryId, db.Set<SupportCategoryRow>().Where(c => c.Id == x.CategoryId).Select(c => c.Name).First(),
        x.Status, x.Priority, x.AssigneeId, db.Profiles.Where(p => p.Id == x.AssigneeId).Select(p => p.DisplayName).FirstOrDefault(),
        x.CreatedAt, x.UpdatedAt, x.Version));
    private IQueryable<Guid> Agents() => (from m in db.UserRoles join c in db.RoleClaims on m.RoleId equals c.RoleId
        join p in db.Profiles on m.UserId equals p.Id join u in db.Users on p.Id equals u.Id
        where c.ClaimType == "permission" && (c.ClaimValue == Permissions.SupportAgent || c.ClaimValue == Permissions.SupportAdmin) && !p.Disabled && u.EmailConfirmed && u.PasswordHash != null
        select m.UserId).Distinct();

    public async Task<Result<SupportOptions>> Options(string search, CancellationToken ct)
    {
        if (!await Available(ct)) return Result<SupportOptions>.Fail("support.not_found", ErrorKind.NotFound);
        if (search.Length > 120) return Result<SupportOptions>.Fail("query.invalid", ErrorKind.Validation);
        var permissions = await access.ActorPermissions(ct);
        var admin = permissions.Contains(Permissions.SupportAdmin); var agent = admin || permissions.Contains(Permissions.SupportAgent);
        var categories = await db.Set<SupportCategoryRow>().AsNoTracking().Where(x => admin || x.Active).OrderBy(x => x.Name)
            .Select(x => new SupportCategory(x.Id, x.Name, x.Active, x.Version)).ToArrayAsync(ct);
        var agents = agent ? await db.Profiles.AsNoTracking().Where(x => Agents().Contains(x.Id) && x.DisplayName.Contains(search))
            .OrderBy(x => x.DisplayName).ThenBy(x => x.Id).Take(100).Select(x => new SupportAgent(x.Id, x.DisplayName)).ToArrayAsync(ct) : [];
        return Result<SupportOptions>.Success(new(categories, agents, agent, admin));
    }
    public async Task<Result<Page<TicketItem>>> List(ListTickets q, CancellationToken ct)
    {
        if (!await Available(ct)) return Result<Page<TicketItem>>.Fail("support.not_found", ErrorKind.NotFound);
        var agent = await Agent(ct);
        if (q.Queue && !agent) return Result<Page<TicketItem>>.Fail("authorization.denied", ErrorKind.Forbidden);
        var source = Visible(q.Queue && agent).AsNoTracking().Where(x => x.Subject.Contains(q.Search));
        if (q.Status != "") source = source.Where(x => x.Status == q.Status);
        if (q.Priority != "") source = source.Where(x => x.Priority == q.Priority);
        if (Guid.TryParse(q.Category, out var category)) source = source.Where(x => x.CategoryId == category);
        if (q.Assignee == "unassigned") source = source.Where(x => x.AssigneeId == null);
        else if (Guid.TryParse(q.Assignee, out var assignee)) source = source.Where(x => x.AssigneeId == assignee);
        var total = await source.CountAsync(ct); var items = source; var desc = q.Direction == "desc";
        var ordered = q.Sort switch
        {
            "subject" => desc ? items.OrderByDescending(x => x.Subject) : items.OrderBy(x => x.Subject),
            "requester" => desc ? items.OrderByDescending(x => db.Profiles.Where(p => p.Id == x.RequesterId).Select(p => p.DisplayName).FirstOrDefault()) : items.OrderBy(x => db.Profiles.Where(p => p.Id == x.RequesterId).Select(p => p.DisplayName).FirstOrDefault()),
            "category" => desc ? items.OrderByDescending(x => db.Set<SupportCategoryRow>().Where(c => c.Id == x.CategoryId).Select(c => c.Name).FirstOrDefault()) : items.OrderBy(x => db.Set<SupportCategoryRow>().Where(c => c.Id == x.CategoryId).Select(c => c.Name).FirstOrDefault()),
            "status" => desc ? items.OrderByDescending(x => x.Status) : items.OrderBy(x => x.Status),
            "priority" => desc ? items.OrderByDescending(x => x.Priority == "Urgent" ? 3 : x.Priority == "High" ? 2 : x.Priority == "Normal" ? 1 : 0) : items.OrderBy(x => x.Priority == "Urgent" ? 3 : x.Priority == "High" ? 2 : x.Priority == "Normal" ? 1 : 0),
            "assignee" => desc ? items.OrderByDescending(x => db.Profiles.Where(p => p.Id == x.AssigneeId).Select(p => p.DisplayName).FirstOrDefault()) : items.OrderBy(x => db.Profiles.Where(p => p.Id == x.AssigneeId).Select(p => p.DisplayName).FirstOrDefault()),
            "createdAt" => desc ? items.OrderByDescending(x => x.CreatedAt) : items.OrderBy(x => x.CreatedAt),
            _ => desc ? items.OrderByDescending(x => x.UpdatedAt) : items.OrderBy(x => x.UpdatedAt)
        };
        return Result<Page<TicketItem>>.Success(new(await Items(ordered.ThenBy(x => x.Id).Skip((q.PageNumber - 1) * q.PageSize).Take(q.PageSize)).ToArrayAsync(ct), total, q.PageNumber, q.PageSize));
    }
    public async Task<Result<TicketDetail>> Get(GetTicket q, CancellationToken ct)
    {
        if (!await Available(ct)) return Result<TicketDetail>.Fail("support.not_found", ErrorKind.NotFound);
        if (q.PageNumber is < 1 or > 10000) return Result<TicketDetail>.Fail("query.invalid", ErrorKind.Validation);
        var agent = await Agent(ct); var visible = Visible(agent).AsNoTracking().Where(x => x.Id == q.Id);
        var item = await Items(visible).SingleOrDefaultAsync(ct);
        if (item == null) return Result<TicketDetail>.Fail("support.not_found", ErrorKind.NotFound);
        var messages = db.Set<SupportMessageRow>().AsNoTracking().Where(x => x.TicketId == q.Id && (agent || !x.Internal));
        var count = await messages.CountAsync(ct);
        var page = await messages.OrderByDescending(x => x.At).ThenBy(x => x.Id).Skip((q.PageNumber - 1) * 25).Take(25)
            .Select(x => new TicketMessage(x.Id, x.AuthorId, db.Profiles.Where(p => p.Id == x.AuthorId).Select(p => p.DisplayName).FirstOrDefault(), x.Body, x.Internal, x.Kind, x.At)).ToArrayAsync(ct);
        var assignedIds = page.Where(x => x.Kind == "assignment" && Guid.TryParse(x.Body, out _)).Select(x => Guid.Parse(x.Body)).ToArray();
        var names = await db.Profiles.AsNoTracking().Where(x => assignedIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.DisplayName, ct);
        page = page.Select(x => x.Kind == "assignment" ? x with { Body = Guid.TryParse(x.Body, out var assigned) ? names.GetValueOrDefault(assigned) ?? "" : "" } : x).ToArray();
        var attachments = await db.Set<SupportAttachmentRow>().AsNoTracking().Where(x => x.TicketId == q.Id).OrderBy(x => x.At)
            .Select(x => new TicketAttachment(x.Id, x.Name, x.Content.Length, x.At)).ToArrayAsync(ct);
        return Result<TicketDetail>.Success(new(item, await visible.Select(x => x.Description).SingleAsync(ct), new(page, count, q.PageNumber, 25), attachments, agent));
    }
    public async Task<Result<Guid>> Create(CreateTicket q, CancellationToken ct)
    {
        if (!await Available(ct)) return Result<Guid>.Fail("support.not_found", ErrorKind.NotFound);
        if (!await db.Set<SupportCategoryRow>().AnyAsync(x => x.Id == q.CategoryId && x.Active, ct)) return Result<Guid>.Fail("support.category_invalid", ErrorKind.Validation);
        var ticket = new SupportTicketRow { RequesterId = context.ActorId!.Value, Subject = q.Subject.Trim(), Description = q.Description.Trim(), CategoryId = q.CategoryId, CreatedAt = time.GetUtcNow(), UpdatedAt = time.GetUtcNow() };
        db.Add(ticket); Audit(ticket, "created");
        return Result<Guid>.Success(ticket.Id);
    }
    // Serialize writes per ticket; version checks prevent stale replies/edits and bound attachment quotas under concurrency.
    private async Task<SupportTicketRow?> Lock(Guid id, bool agent, CancellationToken ct)
    {
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({"support:" + id}, 0))", ct);
        return await Visible(agent).SingleOrDefaultAsync(x => x.Id == id, ct);
    }
    private void Touch(SupportTicketRow ticket) { ticket.Version = Guid.NewGuid(); ticket.UpdatedAt = time.GetUtcNow(); }
    private void Audit(SupportTicketRow ticket, string action) => db.Audit.Add(new() { ActorId = context.ActorId, SubjectId = ticket.Id, SubjectType = "support-ticket", Action = "support." + action, At = time.GetUtcNow() });
    private void History(SupportTicketRow ticket, string kind, string body = "", bool internalNote = false) => db.Add(new SupportMessageRow { TicketId = ticket.Id, AuthorId = context.ActorId, Kind = kind, Body = body, Internal = internalNote, At = time.GetUtcNow() });
    private async Task Notify(Guid? user, Guid ticket, CancellationToken ct)
    {
        if (user == null || user == context.ActorId) return;
        var profile = await db.Profiles.AsNoTracking().SingleOrDefaultAsync(x => x.Id == user && !x.Disabled, ct);
        if (profile == null) return;
        var link = $"/support/{ticket}";
        db.Notifications.Add(new() { UserId = user.Value, Kind = "notificationSupport", Link = link, CreatedAt = time.GetUtcNow() });
        var url = protection.CreateProtector("TemplateV4.email.action.v1").Protect($"{config["Web:PublicUrl"]?.TrimEnd('/')}{link}");
        outbox.Add(new EmailRequest(user.Value, EmailTemplate.SupportTicket, profile.Culture, url));
    }
    public async Task<Result<Unit>> Reply(ReplyTicket q, CancellationToken ct)
    {
        if (!await Available(ct)) return Result.Fail("support.not_found", ErrorKind.NotFound);
        var agent = await Agent(ct);
        if (q.Internal && !agent) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        var ticket = await Lock(q.Id, agent, ct);
        if (ticket == null) return Result.Fail("support.not_found", ErrorKind.NotFound);
        if (ticket.Version != q.Version) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (ticket.Status is "Closed" or "Resolved") return Result.Fail("support.reopen_required", ErrorKind.Conflict);
        History(ticket, "reply", q.Body.Trim(), q.Internal);
        if (!q.Internal && ticket.RequesterId == context.ActorId && ticket.Status == "WaitingOnRequester") { ticket.Status = "Open"; History(ticket, "status", "Open"); }
        Touch(ticket); Audit(ticket, q.Internal ? "internal_note" : "replied");
        if (!q.Internal) await Notify(ticket.RequesterId == context.ActorId ? ticket.AssigneeId : ticket.RequesterId, ticket.Id, ct);
        return Result.Success();
    }
    public async Task<Result<Unit>> Update(UpdateTicket q, CancellationToken ct)
    {
        if (!await Available(ct)) return Result.Fail("support.not_found", ErrorKind.NotFound);
        var agent = await Agent(ct); var ticket = await Lock(q.Id, agent, ct);
        if (ticket == null) return Result.Fail("support.not_found", ErrorKind.NotFound);
        if (ticket.Version != q.Version) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (!TicketWorkflow.CanTransition(ticket.Status, q.Status, agent) || !agent && (q.Priority != ticket.Priority || q.CategoryId != ticket.CategoryId || q.AssigneeId != ticket.AssigneeId))
            return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        if (q.CategoryId != ticket.CategoryId && !await db.Set<SupportCategoryRow>().AnyAsync(x => x.Id == q.CategoryId && x.Active, ct)) return Result.Fail("support.category_invalid", ErrorKind.Validation);
        if (q.AssigneeId != null && q.AssigneeId != ticket.AssigneeId && !await Agents().ContainsAsync(q.AssigneeId.Value, ct)) return Result.Fail("support.assignee_invalid", ErrorKind.Validation);
        if (ticket.Status != q.Status) { History(ticket, "status", q.Status); await Notify(ticket.RequesterId == context.ActorId ? ticket.AssigneeId : ticket.RequesterId, ticket.Id, ct); }
        if (ticket.AssigneeId != q.AssigneeId) { History(ticket, "assignment", q.AssigneeId?.ToString() ?? "", internalNote: true); await Notify(q.AssigneeId, ticket.Id, ct); }
        if (ticket.Priority != q.Priority) History(ticket, "priority", q.Priority);
        if (ticket.CategoryId != q.CategoryId) History(ticket, "category");
        ticket.Status = q.Status; ticket.Priority = q.Priority; ticket.CategoryId = q.CategoryId; ticket.AssigneeId = q.AssigneeId;
        Touch(ticket); Audit(ticket, "updated"); return Result.Success();
    }
    public async Task<Result<Unit>> Category(SaveSupportCategory q, CancellationToken ct)
    {
        if (!await Available(ct)) return Result.Fail("support.not_found", ErrorKind.NotFound);
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
    public async Task<Result<Unit>> Attach(AttachTicket q, CancellationToken ct)
    {
        if (!await Available(ct)) return Result.Fail("support.not_found", ErrorKind.NotFound);
        var ticket = await Lock(q.Id, await Agent(ct), ct);
        if (ticket == null) return Result.Fail("support.not_found", ErrorKind.NotFound);
        if (ticket.Version != q.Version) return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (ticket.Status is "Closed" or "Resolved") return Result.Fail("support.reopen_required", ErrorKind.Conflict);
        var files = db.Set<SupportAttachmentRow>().Where(x => x.TicketId == q.Id);
        if (await files.CountAsync(ct) >= 10 || await files.SumAsync(x => (long)x.Content.Length, ct) + q.Content.Length > 20 * 1024 * 1024)
            return Result.Fail("support.attachment_limit", ErrorKind.Conflict);
        db.Add(new SupportAttachmentRow { TicketId = q.Id, OwnerId = context.ActorId!.Value, Name = q.Name.Trim(), Content = q.Content, At = time.GetUtcNow() });
        Touch(ticket); History(ticket, "attachment"); Audit(ticket, "attachment_added");
        await Notify(ticket.RequesterId == context.ActorId ? ticket.AssigneeId : ticket.RequesterId, ticket.Id, ct);
        return Result.Success();
    }
    public async Task<Result<TicketDownload>> Download(Guid id, Guid attachmentId, CancellationToken ct)
    {
        if (!await Available(ct) || !await Visible(await Agent(ct)).AnyAsync(x => x.Id == id, ct)) return Result<TicketDownload>.Fail("support.not_found", ErrorKind.NotFound);
        var file = await db.Set<SupportAttachmentRow>().AsNoTracking().Where(x => x.Id == attachmentId && x.TicketId == id).Select(x => new TicketDownload(x.Name, x.Content)).SingleOrDefaultAsync(ct);
        return file == null ? Result<TicketDownload>.Fail("support.not_found", ErrorKind.NotFound) : Result<TicketDownload>.Success(file);
    }
}
