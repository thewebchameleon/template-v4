using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
namespace TemplateV4.Infrastructure.Persistence;
public sealed class InvoicingMigrations(InvoicingDb db) : IMigrationContributor
{
    public string ModuleId => "invoicing";
    public int Order => 103;
    public Task Migrate(CancellationToken ct) => db.Database.MigrateAsync(ct);
}
