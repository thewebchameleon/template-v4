using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace templatev4.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class PersistAdminBootstrapCompletion : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "BootstrapCompletedAt",
            schema: "identity",
            table: "security_settings",
            type: "timestamp with time zone",
            nullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "BootstrapCompletedAt",
            schema: "identity",
            table: "security_settings");
    }
}
