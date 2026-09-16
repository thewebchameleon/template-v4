using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Support;
using TemplateV4.Infrastructure.Modules;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Support;

public sealed class SupportModuleSettingsStore(FrameworkDb db, ModuleCatalog catalog, IExecutionContext context, TimeProvider time) : ISupportModuleSettings
{
    private static SupportModuleSettings Describe(SupportSettingsRow row) => new(row.EnquiriesEnabled, row.TicketsEnabled, row.NotificationEmail, row.Version);
    public async Task<Result<SupportModuleSettings>> Read(CancellationToken ct)
    {
        if (!await ModuleActivationStore.IsAdministrator(db, context, ct)) return Result<SupportModuleSettings>.Fail("authorization.denied", ErrorKind.Forbidden);
        var row = await db.Set<SupportSettingsRow>().AsNoTracking().SingleOrDefaultAsync(ct);
        return row is null ? Result<SupportModuleSettings>.Fail("modules.unavailable", ErrorKind.Conflict) : Result<SupportModuleSettings>.Success(Describe(row));
    }
    public async Task<string?> NotificationRecipient(CancellationToken ct)
        => await db.Set<SupportSettingsRow>().AsNoTracking().Select(x => x.NotificationEmail).SingleOrDefaultAsync(ct) is { Length: > 0 } email ? email : null;

    public async Task<Result<SupportModuleSettings>> Save(SaveSupportModuleSettings request, CancellationToken ct)
    {
        if (!await ModuleActivationStore.IsAdministrator(db, context, ct)) return Result<SupportModuleSettings>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (!catalog.Enabled(ModuleIds.Support)) return Result<SupportModuleSettings>.Fail("modules.unavailable", ErrorKind.Conflict);
        if (new SaveSupportModuleSettingsValidator().Validate(request).Count != 0) return Result<SupportModuleSettings>.Fail("validation.failed", ErrorKind.Validation);
        await ModuleActivationStore.LockRows(db, ct);
        var row = await db.Set<SupportSettingsRow>().FromSqlRaw("SELECT * FROM support.settings WHERE \"Id\" = 1 FOR UPDATE").SingleOrDefaultAsync(ct);
        if (row is null) return Result<SupportModuleSettings>.Fail("modules.unavailable", ErrorKind.Conflict);
        if (row.Version != request.Version) return Result<SupportModuleSettings>.Fail("modules.conflict", ErrorKind.Conflict);
        var changes = new List<AuditChange>();
        void Changed(string field, bool before, bool after) { if (before != after) changes.Add(new(field, before.ToString(), after.ToString())); }
        Changed("enquiriesEnabled", row.EnquiriesEnabled, request.EnquiriesEnabled);
        Changed("ticketsEnabled", row.TicketsEnabled, request.TicketsEnabled);
        // Audit recipient changes without exposing the address.
        if (row.NotificationEmail != request.NotificationEmail) changes.Add(new("notificationRecipientChanged", "False", "True"));
        if (changes.Count == 0) return Result<SupportModuleSettings>.Success(Describe(row));
        row.EnquiriesEnabled = request.EnquiriesEnabled; row.TicketsEnabled = request.TicketsEnabled;
        row.NotificationEmail = request.NotificationEmail; row.Version = Guid.NewGuid();
        db.Audit.Add(new()
        {
            ActorId = context.ActorId,
            SubjectType = "module",
            SubjectNameSnapshot = ModuleIds.Support,
            Action = "module.support_features_changed",
            ChangesJson = AuditCapture.Changes(changes.ToArray()),
            At = time.GetUtcNow(),
            TraceParent = context.TraceParent
        });
        return Result<SupportModuleSettings>.Success(Describe(row));
    }
}
