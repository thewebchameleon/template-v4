using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Modules;

public sealed class RuntimeModuleStore(FrameworkDb db, ModuleCatalog catalog, IExecutionContext context, TimeProvider time) : IRuntimeModules
{
    public async Task<RuntimeModule[]> Read(CancellationToken ct)
    {
        var rows = await db.RuntimeModules.AsNoTracking().Where(x => x.Id == "files").OrderBy(x => x.Id).ToArrayAsync(ct);
        return rows.Select(x => new RuntimeModule(x.Id, x.Enabled, catalog.Enabled(x.Id), x.Version)).ToArray();
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
        if (request.Id != "files") return Result<RuntimeModule>.Fail("modules.unknown", ErrorKind.Validation);
        if (request.Enabled && !catalog.Enabled(request.Id)) return Result<RuntimeModule>.Fail("modules.unavailable", ErrorKind.Conflict);
        var version = Guid.NewGuid();
        var changed = await db.RuntimeModules.Where(x => x.Id == request.Id && x.Version == request.Version)
            .ExecuteUpdateAsync(x => x.SetProperty(s => s.Enabled, request.Enabled).SetProperty(s => s.Version, version), ct);
        if (changed == 0) return Result<RuntimeModule>.Fail("modules.conflict", ErrorKind.Conflict);
        db.Audit.Add(new() { ActorId = context.ActorId, Action = request.Enabled ? "module.files_enabled" : "module.files_disabled", At = time.GetUtcNow(), TraceParent = context.TraceParent });
        return Result<RuntimeModule>.Success(new(request.Id, request.Enabled, catalog.Enabled(request.Id), version));
    }
}
