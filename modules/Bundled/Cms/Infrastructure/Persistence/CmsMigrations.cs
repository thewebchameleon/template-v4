using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
namespace TemplateV4.Infrastructure.Persistence;
public sealed class CmsMigrations(CmsDb db) : IMigrationContributor
{
    public string ModuleId => "cms";
    public int Order => 100;
    public Task Migrate(CancellationToken ct) => db.Database.MigrateAsync(ct);
}
