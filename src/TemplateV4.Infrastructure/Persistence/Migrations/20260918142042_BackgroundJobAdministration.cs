using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class BackgroundJobAdministration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DefinitionId",
                schema: "messaging",
                table: "job_runs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "maintenance");

            migrationBuilder.CreateTable(
                name: "background_job_schedules",
                schema: "messaging",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Paused = table.Column<bool>(type: "boolean", nullable: false),
                    NextRunAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    Version = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_background_job_schedules", x => x.Id);
                });

            migrationBuilder.InsertData(
                schema: "messaging",
                table: "background_job_schedules",
                columns: new[] { "Id", "NextRunAt", "Paused", "UpdatedAt", "UpdatedBy", "Version" },
                values: new object[] { "maintenance", null, false, new DateTimeOffset(new DateTime(2026, 9, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, new Guid("b82be80f-7d60-4ae7-bf4e-52351b480702") });

            migrationBuilder.CreateIndex(
                name: "IX_job_runs_DefinitionId_AvailableAt",
                schema: "messaging",
                table: "job_runs",
                columns: new[] { "DefinitionId", "AvailableAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "background_job_schedules",
                schema: "messaging");

            migrationBuilder.DropIndex(
                name: "IX_job_runs_DefinitionId_AvailableAt",
                schema: "messaging",
                table: "job_runs");

            migrationBuilder.DropColumn(
                name: "DefinitionId",
                schema: "messaging",
                table: "job_runs");
        }
    }
}
