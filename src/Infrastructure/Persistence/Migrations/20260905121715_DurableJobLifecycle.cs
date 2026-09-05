using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace templatev4.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class DurableJobLifecycle : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "job_runs",
            schema: "messaging",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                State = table.Column<string>(type: "text", nullable: false),
                Culture = table.Column<string>(type: "text", nullable: false),
                ActorId = table.Column<Guid>(type: "uuid", nullable: true),
                TraceParent = table.Column<string>(type: "text", nullable: true),
                Attempts = table.Column<int>(type: "integer", nullable: false),
                AvailableAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                LeaseUntil = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                CompletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                ErrorCode = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_job_runs", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "rate_buckets",
            schema: "identity",
            columns: table => new
            {
                Id = table.Column<string>(type: "text", nullable: false),
                Count = table.Column<int>(type: "integer", nullable: false),
                ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_rate_buckets", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_job_runs_State_AvailableAt",
            schema: "messaging",
            table: "job_runs",
            columns: new[] { "State", "AvailableAt" });

        migrationBuilder.CreateIndex(
            name: "IX_rate_buckets_ExpiresAt",
            schema: "identity",
            table: "rate_buckets",
            column: "ExpiresAt");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "job_runs",
            schema: "messaging");

        migrationBuilder.DropTable(
            name: "rate_buckets",
            schema: "identity");
    }
}
