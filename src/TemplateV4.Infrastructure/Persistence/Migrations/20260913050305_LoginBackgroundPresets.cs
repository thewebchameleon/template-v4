using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class LoginBackgroundPresets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LoginBackground",
                schema: "app",
                table: "platform_appearance_settings",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "blue-sky");

            migrationBuilder.UpdateData(
                schema: "app",
                table: "platform_appearance_settings",
                keyColumn: "Id",
                keyValue: 1,
                column: "LoginBackground",
                value: "blue-sky");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LoginBackground",
                schema: "app",
                table: "platform_appearance_settings");
        }
    }
}
