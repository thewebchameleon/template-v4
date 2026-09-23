using Microsoft.EntityFrameworkCore;
namespace TemplateV4.Infrastructure.Persistence;
public static class ModuleLocks
{
    public static Task Organisation(DbContext db, CancellationToken ct) => db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74842002)", ct);
}
