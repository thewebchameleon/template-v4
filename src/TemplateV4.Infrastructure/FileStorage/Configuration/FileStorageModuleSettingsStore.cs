using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Modules;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed class FileStorageModuleSettingsStore(FrameworkDb db, ModuleCatalog catalog, IExecutionContext context, TimeProvider time, TemplateV4.Infrastructure.Security.DemoPasswordVerifier passwords) : IFileStorageModuleSettings
{
    public async Task<FileStorageModuleSettings> Read(CancellationToken ct)
    {
        var row = await db.FileStorageSettings.AsNoTracking().SingleAsync(ct);
        return new(row.DemoMode, row.SlowUploadMode, row.Version, row.DemoExpiryMinutes);
    }
    public async Task<Result<FileStorageModuleSettings>> Save(SaveFileStorageModuleSettings request, CancellationToken ct)
    {
        if (!await ModuleActivationStore.IsAdministrator(db, context, ct)) return Result<FileStorageModuleSettings>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (!catalog.Enabled(ModuleIds.FileStorage)) return Result<FileStorageModuleSettings>.Fail("modules.unavailable", ErrorKind.Conflict);
        await ModuleActivationStore.LockRows(db, ct);
        var settings = await db.FileStorageSettings.FromSqlRaw("SELECT * FROM file_storage.file_storage_settings WHERE \"Id\" = 1 FOR UPDATE").AsNoTracking().SingleAsync(ct);
        if (settings.Version != request.Version) return Result<FileStorageModuleSettings>.Fail("modules.conflict", ErrorKind.Conflict);
        if (request.DemoMode && !settings.DemoMode && !await passwords.Verify(context.ActorId!.Value, request.Password, ct))
            return Result<FileStorageModuleSettings>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (request.DemoMode == settings.DemoMode && request.SlowUploadMode == settings.SlowUploadMode)
            return Result<FileStorageModuleSettings>.Success(new(settings.DemoMode, settings.SlowUploadMode, settings.Version, settings.DemoExpiryMinutes));
        var version = Guid.NewGuid();
        var demoStartedAt = request.DemoMode == settings.DemoMode ? settings.DemoStartedAt
            : request.DemoMode ? time.GetUtcNow() : (DateTimeOffset?)null;
        await db.FileStorageSettings.Where(x => x.Id == 1).ExecuteUpdateAsync(x => x
            .SetProperty(s => s.DemoMode, request.DemoMode)
            .SetProperty(s => s.SlowUploadMode, request.SlowUploadMode)
            .SetProperty(s => s.DemoStartedAt, demoStartedAt)
            .SetProperty(s => s.Version, version), ct);
        void Audit(string action, string field, bool before, bool after)
        {
            if (before == after) return;
            db.Audit.Add(new()
            {
                ActorId = context.ActorId,
                SubjectType = "module",
                SubjectNameSnapshot = ModuleIds.FileStorage,
                Action = action,
                ChangesJson = AuditCapture.Changes(new AuditChange(field, before.ToString(), after.ToString())),
                At = time.GetUtcNow(),
                TraceParent = context.TraceParent
            });
        }
        Audit("module.file-storage_slow_upload_changed", "slowUploadMode", settings.SlowUploadMode, request.SlowUploadMode);
        Audit("module.file-storage_demo_changed", "demoMode", settings.DemoMode, request.DemoMode);
        return Result<FileStorageModuleSettings>.Success(await Read(ct));
    }
}
