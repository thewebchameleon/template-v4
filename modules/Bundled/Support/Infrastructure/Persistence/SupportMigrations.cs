using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
namespace TemplateV4.Infrastructure.Persistence;
public sealed class SupportMigrations(SupportDb db) : IMigrationContributor
{
    public string ModuleId => "support";
    public int Order => 102;
    public Task Migrate(CancellationToken ct) => db.Database.MigrateAsync(ct);
}
