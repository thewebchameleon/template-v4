using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ConfigurableMaxUploadFileSize : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "MaxUploadBytes",
                schema: "files",
                table: "file_storage_settings",
                type: "bigint",
                nullable: false,
                defaultValue: 20971520L);

            migrationBuilder.UpdateData(
                schema: "files",
                table: "file_storage_settings",
                keyColumn: "Id",
                keyValue: 1,
                column: "MaxUploadBytes",
                value: 20971520L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxUploadBytes",
                schema: "files",
                table: "file_storage_settings");
        }
    }
}
