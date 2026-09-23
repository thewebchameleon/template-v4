using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class WebsiteSetupCmsSectionsAndContact : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "contact");

            migrationBuilder.EnsureSchema(
                name: "website");

            migrationBuilder.CreateTable(
                name: "enquiries",
                schema: "contact",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    Message = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Read = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_enquiries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "images",
                schema: "website",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContentType = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_images", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "sections",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Version = table.Column<Guid>(type: "uuid", nullable: false),
                    Draft = table.Column<string>(type: "text", nullable: false),
                    Published = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sections", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "settings",
                schema: "website",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Version = table.Column<Guid>(type: "uuid", nullable: false),
                    Details = table.Column<string>(type: "text", nullable: false),
                    NotificationEmail = table.Column<string>(type: "text", nullable: false),
                    Configured = table.Column<bool>(type: "boolean", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_settings1", x => x.Id);
                });

            migrationBuilder.InsertData(
                schema: "app",
                table: "runtime_modules",
                columns: new[] { "Id", "Enabled", "Version" },
                values: new object[] { "contact", true, new Guid("1435e55e-cf92-4619-baf4-b4a27327e98b") });

            migrationBuilder.InsertData(
                schema: "cms",
                table: "sections",
                columns: new[] { "Id", "Draft", "Published", "Version" },
                values: new object[] { 1, "[]", "[]", new Guid("06416342-7225-40b5-95d3-216c4a5971d2") });

            migrationBuilder.InsertData(
                schema: "website",
                table: "settings",
                columns: new[] { "Id", "Configured", "Details", "Enabled", "NotificationEmail", "Version" },
                values: new object[] { 1, false, "{}", false, "", new Guid("1dd69198-4c66-431d-b35b-cc8d4d65a123") });

            migrationBuilder.CreateIndex(
                name: "IX_enquiries_CreatedAt_Id",
                schema: "contact",
                table: "enquiries",
                columns: new[] { "CreatedAt", "Id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "enquiries",
                schema: "contact");

            migrationBuilder.DropTable(
                name: "images",
                schema: "website");

            migrationBuilder.DropTable(
                name: "sections",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "settings",
                schema: "website");

            migrationBuilder.DeleteData(
                schema: "app",
                table: "runtime_modules",
                keyColumn: "Id",
                keyValue: "contact");
        }
    }
}
