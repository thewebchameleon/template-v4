using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed partial class PrivacyService
{
    public async Task<byte[]> Export(Guid actor, CancellationToken ct)
    {
        // Explicit allowlist: never serialize Identity entities, credential material, challenges or message payloads.
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.RepeatableRead, ct);
        var profile = await db.Profiles.AsNoTracking().Where(x => x.Id == actor).Select(x => new { x.Id, x.DisplayName, x.FirstName, x.LastName, x.Culture, x.TimeZone }).SingleAsync(ct);
        var avatar = await db.Set<UserAvatar>().AsNoTracking().Where(x => x.UserId == actor).Select(x => x.Png).SingleOrDefaultAsync(ct);
        var account = await db.Users.AsNoTracking().Where(x => x.Id == actor).Select(x => new { x.Email, x.EmailConfirmed, x.PhoneNumber, x.PhoneNumberConfirmed, x.OptionalEmailEnabled, x.PushEnabled, x.PushShowPreview }).SingleAsync(ct);
        var sessions = await db.Sessions.AsNoTracking().Where(x => x.UserId == actor).Select(x => new { x.Device, x.CreatedAt, x.ExpiresAt, x.RevokedAt }).ToArrayAsync(ct);
        var notifications = await db.Notifications.AsNoTracking().Where(x => x.UserId == actor).Select(x => new { x.Kind, x.Link, x.CreatedAt, x.ReadAt }).ToArrayAsync(ct);
        var files = await db.Files.AsNoTracking().Where(x => x.OwnerId == actor).Select(x => new { x.Id, x.Name, x.Size, x.ContentType, x.CreatedAt, x.DeletedAt, x.PurgedAt, x.IsFolder, x.ParentId, x.Description, x.Tags, x.Important, x.Starred, x.UpdatedAt }).ToArrayAsync(ct);
        var fileShares = await db.Set<FileStorageShare>().AsNoTracking().Where(x => x.RecipientId == actor || db.Files.Any(f => f.Id == x.FileId && f.OwnerId == actor)).Select(x => new { x.FileId, x.RecipientId, x.Permission, x.ExpiresAt }).ToArrayAsync(ct);
        var requests = await db.DeletionRequests.AsNoTracking().Where(x => x.UserId == actor).Select(x => new { x.State, x.RequestedAt, x.ReviewedAt }).ToArrayAsync(ct);
        var actionItemsExport = await db.Set<ActionItemRow>().AsNoTracking().Where(x => x.CreatorId == actor || x.AssigneeId == actor).Select(x => new { x.Title, x.Description, x.Link, x.State, x.CreatedAt, x.CompletedAt }).ToArrayAsync(ct);
        var activity = await db.Audit.AsNoTracking().Where(x => x.SubjectId == actor || x.ActorId == actor).Select(x => new { x.Action, x.At }).ToArrayAsync(ct);
        var supportTickets = await db.Set<SupportTicketRow>().AsNoTracking().Where(x => x.RequesterId == actor).ToArrayAsync(ct);
        var ticketIds = supportTickets.Select(x => x.Id).ToArray();
        var supportMessages = await db.Set<SupportMessageRow>().AsNoTracking().Where(x => ticketIds.Contains(x.TicketId) && !x.Internal).ToArrayAsync(ct);
        var supportAttachments = await db.Set<SupportAttachmentRow>().AsNoTracking().Where(x => ticketIds.Contains(x.TicketId)).Select(x => new { x.Id, x.TicketId, x.Name, Size = x.Content.Length, x.At }).ToArrayAsync(ct);
        var result = JsonSerializer.SerializeToUtf8Bytes(new { ExportedAt = time.GetUtcNow(), ActionItems = actionItemsExport, Profile = profile, AvatarPng = avatar, Account = account, Sessions = sessions, Notifications = notifications, Files = files, FileShares = fileShares, DeletionRequests = requests, Activity = activity, SupportTickets = supportTickets, SupportMessages = supportMessages, SupportAttachments = supportAttachments }, new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = true });
        db.Audit.Add(new() { ActorId = actor, SubjectId = actor, Action = "privacy.exported", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return result;
    }
}
