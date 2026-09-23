using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore.Migrations.Design;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Microsoft.Extensions.DependencyInjection;

namespace TemplateV4.Migrations;

// Used only by the one-time ownership transfer. Subsequent EF migrations use the normal generator.
public class OwnershipDesignServices : IDesignTimeServices
{
    public void ConfigureDesignTimeServices(IServiceCollection services)
        => services.AddSingleton<IMigrationsCodeGenerator, OwnershipGenerator>();
}

public sealed class OwnershipGenerator(MigrationsCodeGeneratorDependencies dependencies, CSharpMigrationsGeneratorDependencies csharp)
    : CSharpMigrationsGenerator(dependencies, csharp)
{
    private static readonly HashSet<string> Transferred = ["cms", "crm", "support", "contact", "invoicing", "commercial_billing"];

    public override string GenerateMigration(string? migrationNamespace, string migrationName,
        IReadOnlyList<MigrationOperation> upOperations, IReadOnlyList<MigrationOperation> downOperations)
    {
        if (migrationName == "AdoptBundledModuleSchema")
        {
            // The permanent core history creates these tables on both fresh and retained databases.
            // Adopt their current model without executing a second CREATE TABLE or reseeding data.
            return base.GenerateMigration(migrationNamespace, migrationName, [], []);
        }
        if (migrationName == "TransferBundledModuleOwnership")
        {
            static bool Owned(MigrationOperation operation) => operation switch
            {
                DropTableOperation x => Transferred.Contains(x.Schema ?? ""),
                DropForeignKeyOperation x => Transferred.Contains(x.Schema ?? ""),
                DeleteDataOperation x => Transferred.Contains(x.Schema ?? ""),
                _ => false
            };
            // Ownership changes only. Never drop transferred tables, retained data or constraints.
            return base.GenerateMigration(migrationNamespace, migrationName, upOperations.Where(x => !Owned(x)).ToArray(),
                [new SqlOperation { Sql = "DO $$ BEGIN RAISE EXCEPTION 'Module ownership transfer requires a forward migration; restore a backup to reverse it.'; END $$;" }]);
        }
        return base.GenerateMigration(migrationNamespace, migrationName, upOperations, downOperations);
    }
}
