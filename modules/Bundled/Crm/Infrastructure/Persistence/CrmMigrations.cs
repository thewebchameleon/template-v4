using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
namespace TemplateV4.Infrastructure.Persistence;
public sealed class CrmMigrations(CrmDb db) : IMigrationContributor
{
    public string ModuleId => "crm";
    public int Order => 101;
    public Task Migrate(CancellationToken ct) => db.Database.MigrateAsync(ct);
}
