using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ReadOnlyFileShares : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Permission",
                schema: "file_storage",
                table: "file_shares");

            migrationBuilder.AddColumn<string>(
                name: "ProtectedToken",
                schema: "file_storage",
                table: "file_shares",
                type: "character varying(1024)",
                maxLength: 1024,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProtectedToken",
                schema: "file_storage",
                table: "file_shares");

            migrationBuilder.AddColumn<string>(
                name: "Permission",
                schema: "file_storage",
                table: "file_shares",
                type: "character varying(12)",
                maxLength: 12,
                nullable: false,
                defaultValue: "");
        }
    }
}
