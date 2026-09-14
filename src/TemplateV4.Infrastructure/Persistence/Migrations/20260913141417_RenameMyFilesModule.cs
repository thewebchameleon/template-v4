using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class RenameMyFilesModule : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("UPDATE app.runtime_modules SET \"Id\" = 'my-files' WHERE \"Id\" = 'files'");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("UPDATE app.runtime_modules SET \"Id\" = 'files' WHERE \"Id\" = 'my-files'");
    }
}
