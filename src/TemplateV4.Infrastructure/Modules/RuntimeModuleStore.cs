using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Modules;

public sealed class RuntimeModuleStore(FrameworkDb db, ModuleCatalog catalog, IExecutionContext context, TimeProvider time) : IRuntimeModules
{
    public async Task<RuntimeModule[]> Read(CancellationToken ct)
    {
        var rows = await db.RuntimeModules.AsNoTracking().Where(x => x.Id == "my-files" || x.Id == "support").OrderBy(x => x.Id).ToArrayAsync(ct);
        var settings = await db.FileStorageSettings.AsNoTracking().SingleAsync(ct);
        return rows.Select(x => new RuntimeModule(x.Id, x.Enabled, catalog.Enabled(x.Id), x.Version, x.Id == "my-files" && settings.DemoMode, x.Id == "my-files" && settings.SlowUploadMode)).ToArray();
    }

    // Read for each request: another API instance's committed change must take effect immediately.
    public async Task<bool> Enabled(string id, CancellationToken ct) => catalog.Enabled(id) &&
        await db.RuntimeModules.AsNoTracking().AnyAsync(x => x.Id == id && x.Enabled, ct);

    // The dispatcher commits the state change and audit entry together.
    public async Task<Result<RuntimeModule>> Save(SaveRuntimeModule request, CancellationToken ct)
    {
        var administrator = await (from membership in db.UserRoles
                                   join role in db.Roles on membership.RoleId equals role.Id
                                   where membership.UserId == context.ActorId && role.Name == "Administrator"
                                   select membership).AnyAsync(ct);
        if (!administrator) return Result<RuntimeModule>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (request.Id is not ("my-files" or "support")) return Result<RuntimeModule>.Fail("modules.unknown", ErrorKind.Validation);
        if (request.DemoMode != null && request.Id != "my-files") return Result<RuntimeModule>.Fail("validation.failed", ErrorKind.Validation);
        if (request.SlowUploadMode != null && request.Id != "my-files") return Result<RuntimeModule>.Fail("validation.failed", ErrorKind.Validation);
        if (request.Enabled && !catalog.Enabled(request.Id)) return Result<RuntimeModule>.Fail("modules.unavailable", ErrorKind.Conflict);
        // Settings edits and irreversible demo purge claims serialize on this row.
        var settings = request.Id == "my-files" ? await db.FileStorageSettings.FromSqlRaw("SELECT * FROM files.file_storage_settings WHERE \"Id\" = 1 FOR UPDATE").AsNoTracking().SingleAsync(ct) : null;
        var previous = await db.RuntimeModules.AsNoTracking().SingleAsync(x => x.Id == request.Id, ct);
        var version = Guid.NewGuid();
        var changed = await db.RuntimeModules.Where(x => x.Id == request.Id && x.Version == request.Version)
            .ExecuteUpdateAsync(x => x.SetProperty(s => s.Enabled, request.Enabled).SetProperty(s => s.Version, version), ct);
        if (changed == 0) return Result<RuntimeModule>.Fail("modules.conflict", ErrorKind.Conflict);
        var demo = settings?.DemoMode ?? false;
        var slowUpload = settings?.SlowUploadMode ?? false;
        if (settings != null && request.SlowUploadMode is bool requestedSlow && requestedSlow != slowUpload)
        {
            await db.FileStorageSettings.Where(x => x.Id == 1).ExecuteUpdateAsync(x => x
                .SetProperty(s => s.SlowUploadMode, requestedSlow)
                .SetProperty(s => s.Version, Guid.NewGuid()), ct);
            db.Audit.Add(new() { ActorId = context.ActorId, SubjectType = "module", SubjectNameSnapshot = request.Id, Action = "module.my-files_slow_upload_changed", ChangesJson = AuditCapture.Changes(new AuditChange("slowUploadMode", slowUpload.ToString(), requestedSlow.ToString())), At = time.GetUtcNow(), TraceParent = context.TraceParent });
            slowUpload = requestedSlow;
        }
        if (settings != null && request.DemoMode is bool requested && requested != demo)
        {
            await db.FileStorageSettings.Where(x => x.Id == 1).ExecuteUpdateAsync(x => x
                .SetProperty(s => s.DemoMode, requested)
                .SetProperty(s => s.DemoStartedAt, requested ? time.GetUtcNow() : (DateTimeOffset?)null)
                .SetProperty(s => s.Version, Guid.NewGuid()), ct);
            db.Audit.Add(new() { ActorId = context.ActorId, SubjectType = "module", SubjectNameSnapshot = request.Id, Action = "module.my-files_demo_changed", ChangesJson = AuditCapture.Changes(new AuditChange("demoMode", demo.ToString(), requested.ToString())), At = time.GetUtcNow(), TraceParent = context.TraceParent });
            demo = requested;
        }
        if (previous.Enabled != request.Enabled)
        db.Audit.Add(new() { ActorId = context.ActorId, SubjectType = "module", SubjectNameSnapshot = request.Id, ChangesJson = AuditCapture.Changes(new AuditChange("enabled", previous.Enabled.ToString(), request.Enabled.ToString())), Action = "module." + request.Id + (request.Enabled ? "_enabled" : "_disabled"), At = time.GetUtcNow(), TraceParent = context.TraceParent });
        return Result<RuntimeModule>.Success(new(request.Id, request.Enabled, catalog.Enabled(request.Id), version, demo, slowUpload));
    }
}
