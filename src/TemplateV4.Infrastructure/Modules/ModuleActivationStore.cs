using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Modules;

public sealed class ModuleActivationStore(FrameworkDb db, ModuleCatalog catalog, IExecutionContext context, TimeProvider time) : IModuleActivation
{
    public async Task<ModuleActivation[]> Read(CancellationToken ct)
    {
        var rows = await db.RuntimeModules.AsNoTracking().ToArrayAsync(ct);
        var runtime = rows.ToDictionary(x => x.Id, x => x.Enabled);
        return rows.Where(x => catalog.RuntimeConfigurable(x.Id)).OrderBy(x => x.Id)
            .Select(x => Describe(x, runtime)).ToArray();
    }

    private ModuleActivation Describe(RuntimeModuleSettings row, IReadOnlyDictionary<string, bool> runtime)
        => new(row.Id, row.Enabled, catalog.Enabled(row.Id), row.Version,
            catalog.TransitionBlockers(row.Id, true, runtime), catalog.TransitionBlockers(row.Id, false, runtime));

    public async Task<Result<ModuleActivation>> Save(SaveModuleActivation request, CancellationToken ct)
    {
        if (!await IsAdministrator(db, context, ct)) return Result<ModuleActivation>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (!catalog.RuntimeConfigurable(request.Id)) return Result<ModuleActivation>.Fail("modules.unknown", ErrorKind.Validation);
        if (request.Enabled && !catalog.Enabled(request.Id)) return Result<ModuleActivation>.Fail("modules.unavailable", ErrorKind.Conflict);
        var rows = await LockRows(db, ct);
        var previous = rows.SingleOrDefault(x => x.Id == request.Id);
        if (previous is null) return Result<ModuleActivation>.Fail("modules.unavailable", ErrorKind.Conflict);
        if (previous.Version != request.Version) return Result<ModuleActivation>.Fail("modules.conflict", ErrorKind.Conflict);
        var runtime = rows.ToDictionary(x => x.Id, x => x.Enabled);
        var blockers = catalog.TransitionBlockers(request.Id, request.Enabled, runtime);
        if (blockers.Length != 0)
            return Result<ModuleActivation>.Fail("modules.dependencies", ErrorKind.Conflict, new() { ["dependencies"] = blockers });
        var version = Guid.NewGuid();
        await db.RuntimeModules.Where(x => x.Id == request.Id).ExecuteUpdateAsync(x => x
            .SetProperty(s => s.Enabled, request.Enabled).SetProperty(s => s.Version, version), ct);
        if (previous.Enabled != request.Enabled)
            db.Audit.Add(new()
            {
                ActorId = context.ActorId,
                SubjectType = "module",
                SubjectNameSnapshot = request.Id,
                ChangesJson = AuditCapture.Changes(new AuditChange("enabled", previous.Enabled.ToString(), request.Enabled.ToString())),
                Action = "module." + request.Id + (request.Enabled ? "_enabled" : "_disabled"),
                At = time.GetUtcNow(),
                TraceParent = context.TraceParent
            });
        previous.Enabled = request.Enabled; previous.Version = version; runtime[request.Id] = request.Enabled;
        return Result<ModuleActivation>.Success(Describe(previous, runtime));
    }

    internal static Task<bool> IsAdministrator(FrameworkDb db, IExecutionContext context, CancellationToken ct)
        => (from membership in db.UserRoles
            join role in db.Roles on membership.RoleId equals role.Id
            where membership.UserId == context.ActorId && role.Name == "Administrator"
            select membership).AnyAsync(ct);

    // All activation/settings writers take these locks first, in stable order, inside the dispatcher transaction.
    internal static Task<RuntimeModuleSettings[]> LockRows(FrameworkDb db, CancellationToken ct)
    {
        if (db.Database.CurrentTransaction is null) throw new InvalidOperationException("Module changes require a transaction.");
        return db.RuntimeModules.FromSqlRaw("SELECT * FROM app.runtime_modules ORDER BY \"Id\" FOR UPDATE").AsNoTracking().ToArrayAsync(ct);
    }
}
