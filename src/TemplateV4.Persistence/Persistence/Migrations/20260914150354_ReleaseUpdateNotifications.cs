using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ReleaseUpdateNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "release_announcements",
                schema: "app",
                columns: table => new
                {
                    Component = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Version = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_release_announcements", x => new { x.Component, x.Version });
                });

            migrationBuilder.CreateTable(
                name: "release_update_state",
                schema: "app",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    CheckedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    SucceededAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    InstalledHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ReleasesJson = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_release_update_state", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "release_announcements",
                schema: "app");

            migrationBuilder.DropTable(
                name: "release_update_state",
                schema: "app");
        }
    }
}
