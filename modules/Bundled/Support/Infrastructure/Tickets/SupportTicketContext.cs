using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Support;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;

namespace TemplateV4.Infrastructure.Support;

public sealed class SupportTicketContext(SupportDb db, IExecutionContext context, TimeProvider time,
    AccessManagementService access, ICapabilities modules, IEventOutbox outbox,
    IDataProtectionProvider protection, IConfiguration config)
{
    internal async Task<bool> Available(CancellationToken ct)
    {
        if (context.ActorId is not { } actor) return false;
        // Match account erasure's actor lock before accepting new personally identifying content.
        if (db.Database.CurrentTransaction != null)
            await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({actor.ToString()}, 0))", ct);
        return await modules.Enabled(CapabilityIds.SupportTickets, ct) && await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct);
    }
    internal IQueryable<Guid> Agents() => (from m in db.UserRoles
                                           join c in db.RoleClaims on m.RoleId equals c.RoleId
                                           join p in db.Profiles on m.UserId equals p.Id
                                           join u in db.Users on p.Id equals u.Id
                                           where c.ClaimType == "permission" && (c.ClaimValue == Permissions.SupportAgent || c.ClaimValue == Permissions.SupportAdmin) && !p.Disabled && u.EmailConfirmed && u.PasswordHash != null
                                           select m.UserId).Distinct();

    internal async Task<bool> Agent(CancellationToken ct) => (await access.ActorPermissions(ct)).Any(p => p is Permissions.SupportAgent or Permissions.SupportAdmin);
    internal IQueryable<SupportTicketRow> Visible(bool agent) => db.Set<SupportTicketRow>().Where(x => agent || x.RequesterId == context.ActorId);
    internal IQueryable<TicketItem> Items(IQueryable<SupportTicketRow> source) => source.Select(x => new TicketItem(x.Id, x.Subject, x.RequesterId,
        db.Profiles.Where(p => p.Id == x.RequesterId).Select(p => p.DisplayName).FirstOrDefault() ?? "",
        x.CategoryId, db.Set<SupportCategoryRow>().Where(c => c.Id == x.CategoryId).Select(c => c.Name).First(),
        x.Status, x.Priority, x.AssigneeId, db.Profiles.Where(p => p.Id == x.AssigneeId).Select(p => p.DisplayName).FirstOrDefault(),
        x.CreatedAt, x.UpdatedAt, x.Version));
    // Serialize writes per ticket; version checks prevent stale replies/edits and bound attachment quotas under concurrency.
    internal async Task<SupportTicketRow?> Lock(Guid id, bool agent, CancellationToken ct)
    {
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({"support:" + id}, 0))", ct);
        return await Visible(agent).SingleOrDefaultAsync(x => x.Id == id, ct);
    }
    internal void Touch(SupportTicketRow ticket) { ticket.Version = Guid.NewGuid(); ticket.UpdatedAt = time.GetUtcNow(); }
    internal void Audit(SupportTicketRow ticket, string action) => db.Audit.Add(new() { ActorId = context.ActorId, SubjectId = ticket.Id, SubjectType = "support-ticket", Action = "support." + action, At = time.GetUtcNow() });
    internal void History(SupportTicketRow ticket, string kind, string body = "", bool internalNote = false) => db.Add(new SupportMessageRow { TicketId = ticket.Id, AuthorId = context.ActorId, Kind = kind, Body = body, Internal = internalNote, At = time.GetUtcNow() });
    internal async Task Notify(Guid? user, Guid ticket, CancellationToken ct)
    {
        if (user == null || user == context.ActorId) return;
        var profile = await db.Profiles.AsNoTracking().SingleOrDefaultAsync(x => x.Id == user && !x.Disabled, ct);
        if (profile == null) return;
        var link = $"/support/{ticket}";
        db.Notifications.Add(new() { UserId = user.Value, Kind = "notificationSupport", Link = link, CreatedAt = time.GetUtcNow() });
        var url = protection.CreateProtector("TemplateV4.email.action.v1").Protect($"{config["Web:PublicUrl"]?.TrimEnd('/')}{link}");
        outbox.Add(new EmailRequest(user.Value, EmailTemplate.SupportTicket, profile.Culture, url));
    }
}
