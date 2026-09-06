using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class PreferredMfaAndEmailCodes : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "EmailMfaEnabled",
            schema: "identity",
            table: "AspNetUsers",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<int>(
            name: "EmailMfaFailedAttempts",
            schema: "identity",
            table: "AspNetUsers",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "EmailMfaLastSentAt",
            schema: "identity",
            table: "AspNetUsers",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "EmailMfaLockedUntil",
            schema: "identity",
            table: "AspNetUsers",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "PreferredMfaMethod",
            schema: "identity",
            table: "AspNetUsers",
            type: "character varying(32)",
            maxLength: 32,
            nullable: false,
            defaultValue: "Email");

        migrationBuilder.Sql("""
            UPDATE identity."AspNetUsers"
            SET "EmailMfaEnabled" = TRUE
            WHERE "EmailConfirmed" = TRUE
              AND "Email" IS NOT NULL
              AND "Email" NOT LIKE '%@example.invalid'
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "EmailMfaEnabled",
            schema: "identity",
            table: "AspNetUsers");

        migrationBuilder.DropColumn(
            name: "EmailMfaFailedAttempts",
            schema: "identity",
            table: "AspNetUsers");

        migrationBuilder.DropColumn(
            name: "EmailMfaLastSentAt",
            schema: "identity",
            table: "AspNetUsers");

        migrationBuilder.DropColumn(
            name: "EmailMfaLockedUntil",
            schema: "identity",
            table: "AspNetUsers");

        migrationBuilder.DropColumn(
            name: "PreferredMfaMethod",
            schema: "identity",
            table: "AspNetUsers");
    }
}
