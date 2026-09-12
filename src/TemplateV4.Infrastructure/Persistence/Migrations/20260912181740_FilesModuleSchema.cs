using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FilesModuleSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "files");

            migrationBuilder.RenameTable(
                name: "files",
                schema: "app",
                newName: "files",
                newSchema: "files");

            migrationBuilder.RenameTable(
                name: "file_storage_settings",
                schema: "app",
                newName: "file_storage_settings",
                newSchema: "files");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "files",
                schema: "files",
                newName: "files",
                newSchema: "app");

            migrationBuilder.RenameTable(
                name: "file_storage_settings",
                schema: "files",
                newName: "file_storage_settings",
                newSchema: "app");
        }
    }
}
