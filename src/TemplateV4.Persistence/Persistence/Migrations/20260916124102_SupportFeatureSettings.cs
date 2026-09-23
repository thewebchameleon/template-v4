using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SupportFeatureSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_settings1",
                schema: "website",
                table: "settings");



            migrationBuilder.AddPrimaryKey(
                name: "PK_settings2",
                schema: "website",
                table: "settings",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "settings",
                schema: "support",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EnquiriesEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    TicketsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AttachmentsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    NotificationEmail = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    Version = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_settings1", x => x.Id);
                });

            migrationBuilder.InsertData(
                schema: "support",
                table: "settings",
                columns: new[] { "Id", "AttachmentsEnabled", "EnquiriesEnabled", "NotificationEmail", "TicketsEnabled", "Version" },
                values: new object[] { 1, true, true, "", true, new Guid("e8627a13-b631-4c13-a33f-e31fa8d5b2f1") });
            migrationBuilder.Sql("""
                UPDATE support.settings SET
                    "EnquiriesEnabled" = COALESCE((SELECT "Enabled" FROM app.runtime_modules WHERE "Id" = 'contact'), FALSE),
                    "NotificationEmail" = COALESCE((SELECT "NotificationEmail" FROM website.settings WHERE "Id" = 1), '');
                UPDATE website.settings SET "NotificationEmail" = '';
                """);
            migrationBuilder.DeleteData(
                schema: "app",
                table: "runtime_modules",
                keyColumn: "Id",
                keyValue: "contact");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "settings",
                schema: "support");

            migrationBuilder.DropPrimaryKey(
                name: "PK_settings2",
                schema: "website",
                table: "settings");

            migrationBuilder.AddPrimaryKey(
                name: "PK_settings1",
                schema: "website",
                table: "settings",
                column: "Id");

            migrationBuilder.InsertData(
                schema: "app",
                table: "runtime_modules",
                columns: new[] { "Id", "Enabled", "Version" },
                values: new object[] { "contact", true, new Guid("1435e55e-cf92-4619-baf4-b4a27327e98b") });
        }
    }
}
