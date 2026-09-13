using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MyFilesSlowUploadMode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "SlowUploadMode",
                schema: "files",
                table: "file_storage_settings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                schema: "files",
                table: "file_storage_settings",
                keyColumn: "Id",
                keyValue: 1,
                column: "SlowUploadMode",
                value: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SlowUploadMode",
                schema: "files",
                table: "file_storage_settings");
        }
    }
}
