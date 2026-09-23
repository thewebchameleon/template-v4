using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class RenameFileStorageModule : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Rename in place so disabled state, versions, files and share tokens survive.
        migrationBuilder.Sql("UPDATE app.runtime_modules SET \"Id\" = 'file-storage' WHERE \"Id\" = 'my-files'");
        migrationBuilder.EnsureSchema(name: "file_storage");
        migrationBuilder.RenameTable(name: "files", schema: "files", newName: "files", newSchema: "file_storage");
        migrationBuilder.RenameTable(name: "file_storage_settings", schema: "files", newName: "file_storage_settings", newSchema: "file_storage");
        migrationBuilder.RenameTable(name: "my_file_shares", schema: "files", newName: "file_shares", newSchema: "file_storage");
        RenameShareConstraints(migrationBuilder, "file_storage", "my_file_shares", "file_shares");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        RenameShareConstraints(migrationBuilder, "file_storage", "file_shares", "my_file_shares");
        migrationBuilder.EnsureSchema(name: "files");
        migrationBuilder.RenameTable(name: "file_shares", schema: "file_storage", newName: "my_file_shares", newSchema: "files");
        migrationBuilder.RenameTable(name: "file_storage_settings", schema: "file_storage", newName: "file_storage_settings", newSchema: "files");
        migrationBuilder.RenameTable(name: "files", schema: "file_storage", newName: "files", newSchema: "files");
        migrationBuilder.Sql("UPDATE app.runtime_modules SET \"Id\" = 'my-files' WHERE \"Id\" = 'file-storage'");
    }

    private static void RenameShareConstraints(MigrationBuilder migrationBuilder, string schema, string previous, string next)
    {
        var table = previous == "my_file_shares" ? next : previous;
        foreach (var suffix in new[] { "FileId", "RecipientId", "TokenHash" })
            migrationBuilder.RenameIndex(name: $"IX_{previous}_{suffix}", schema: schema, table: table, newName: $"IX_{next}_{suffix}");
        foreach (var constraint in new[] { ("PK_", ""), ("FK_", "_files_FileId"), ("FK_", "_AspNetUsers_RecipientId") })
            migrationBuilder.Sql($"ALTER TABLE {schema}.{table} RENAME CONSTRAINT \"{constraint.Item1}{previous}{constraint.Item2}\" TO \"{constraint.Item1}{next}{constraint.Item2}\"");
    }
}
