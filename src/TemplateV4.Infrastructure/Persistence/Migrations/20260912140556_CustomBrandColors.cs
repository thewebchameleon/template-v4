using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CustomBrandColors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomColorsJson",
                schema: "app",
                table: "platform_appearance_settings",
                type: "jsonb",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<Guid>(
                name: "SelectedCustomColorId",
                schema: "app",
                table: "platform_appearance_settings",
                type: "uuid",
                nullable: true);

            migrationBuilder.UpdateData(
                schema: "app",
                table: "platform_appearance_settings",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CustomColorsJson", "SelectedCustomColorId" },
                values: new object[] { "[]", null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomColorsJson",
                schema: "app",
                table: "platform_appearance_settings");

            migrationBuilder.DropColumn(
                name: "SelectedCustomColorId",
                schema: "app",
                table: "platform_appearance_settings");
        }
    }
}
