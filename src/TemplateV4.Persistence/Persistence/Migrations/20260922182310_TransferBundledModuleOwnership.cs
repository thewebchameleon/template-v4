using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class TransferBundledModuleOwnership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_settings3",
                schema: "website",
                table: "settings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_settings1",
                schema: "payments",
                table: "settings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_entries1",
                schema: "audit",
                table: "entries");

            migrationBuilder.AddPrimaryKey(
                name: "PK_settings1",
                schema: "website",
                table: "settings",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_settings",
                schema: "payments",
                table: "settings",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_entries",
                schema: "audit",
                table: "entries",
                column: "Id");

            migrationBuilder.InsertData(
                schema: "app",
                table: "runtime_modules",
                columns: new[] { "Id", "Enabled", "Version" },
                values: new object[] { "commercial-billing", true, new Guid("174a5cd6-5675-4ad7-a2e0-1cf14b7502fe") });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DO $$ BEGIN RAISE EXCEPTION 'Module ownership transfer requires a forward migration; restore a backup to reverse it.'; END $$;");
        }
    }
}
