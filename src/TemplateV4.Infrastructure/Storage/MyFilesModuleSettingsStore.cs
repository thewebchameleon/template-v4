using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Modules;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed class MyFilesModuleSettingsStore(FrameworkDb db, ModuleCatalog catalog, IExecutionContext context, TimeProvider time) : IMyFilesModuleSettings
{
    public async Task<MyFilesModuleSettings> Read(CancellationToken ct)
    {
        var row = await db.FileStorageSettings.AsNoTracking().SingleAsync(ct);
        return new(row.DemoMode, row.SlowUploadMode, row.Version);
    }
    public async Task<Result<MyFilesModuleSettings>> Save(SaveMyFilesModuleSettings request, CancellationToken ct)
    {
        if (!await ModuleActivationStore.IsAdministrator(db, context, ct)) return Result<MyFilesModuleSettings>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (!catalog.Enabled(ModuleIds.MyFiles)) return Result<MyFilesModuleSettings>.Fail("modules.unavailable", ErrorKind.Conflict);
        await ModuleActivationStore.LockRows(db, ct);
        var settings = await db.FileStorageSettings.FromSqlRaw("SELECT * FROM files.file_storage_settings WHERE \"Id\" = 1 FOR UPDATE").AsNoTracking().SingleAsync(ct);
        if (settings.Version != request.Version) return Result<MyFilesModuleSettings>.Fail("modules.conflict", ErrorKind.Conflict);
        if (request.DemoMode == settings.DemoMode && request.SlowUploadMode == settings.SlowUploadMode)
            return Result<MyFilesModuleSettings>.Success(new(settings.DemoMode, settings.SlowUploadMode, settings.Version));
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
                SubjectNameSnapshot = ModuleIds.MyFiles,
                Action = action,
                ChangesJson = AuditCapture.Changes(new AuditChange(field, before.ToString(), after.ToString())),
                At = time.GetUtcNow(),
                TraceParent = context.TraceParent
            });
        }
        Audit("module.my-files_slow_upload_changed", "slowUploadMode", settings.SlowUploadMode, request.SlowUploadMode);
        Audit("module.my-files_demo_changed", "demoMode", settings.DemoMode, request.DemoMode);
        return Result<MyFilesModuleSettings>.Success(await Read(ct));
    }
}
