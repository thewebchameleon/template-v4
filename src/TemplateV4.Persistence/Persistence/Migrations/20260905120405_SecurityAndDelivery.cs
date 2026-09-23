using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class SecurityAndDelivery : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "MfaVerified",
            schema: "identity",
            table: "sessions",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<bool>(
            name: "SetupOnly",
            schema: "identity",
            table: "sessions",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<Guid>(
            name: "LeaseId",
            schema: "messaging",
            table: "outbox",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "LeaseUntil",
            schema: "messaging",
            table: "outbox",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<long>(
            name: "LastTotpStep",
            schema: "identity",
            table: "AspNetUsers",
            type: "bigint",
            nullable: false,
            defaultValue: 0L);

        migrationBuilder.CreateTable(
            name: "AspNetUserPasskeys",
            schema: "identity",
            columns: table => new
            {
                CredentialId = table.Column<byte[]>(type: "bytea", maxLength: 1024, nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                Data = table.Column<string>(type: "jsonb", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AspNetUserPasskeys", x => x.CredentialId);
                table.ForeignKey(
                    name: "FK_AspNetUserPasskeys_AspNetUsers_UserId",
                    column: x => x.UserId,
                    principalSchema: "identity",
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "auth_challenges",
            schema: "identity",
            columns: table => new
            {
                Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: true),
                Purpose = table.Column<string>(type: "text", nullable: false),
                State = table.Column<string>(type: "text", nullable: false),
                SecurityStamp = table.Column<string>(type: "text", nullable: false),
                Device = table.Column<string>(type: "text", nullable: false),
                ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_auth_challenges", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "security_settings",
            schema: "identity",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                MfaPolicy = table.Column<string>(type: "text", nullable: false),
                Version = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_security_settings", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_AspNetUserPasskeys_UserId",
            schema: "identity",
            table: "AspNetUserPasskeys",
            column: "UserId");

        migrationBuilder.CreateIndex(
            name: "IX_auth_challenges_ExpiresAt",
            schema: "identity",
            table: "auth_challenges",
            column: "ExpiresAt");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "AspNetUserPasskeys",
            schema: "identity");

        migrationBuilder.DropTable(
            name: "auth_challenges",
            schema: "identity");

        migrationBuilder.DropTable(
            name: "security_settings",
            schema: "identity");

        migrationBuilder.DropColumn(
            name: "MfaVerified",
            schema: "identity",
            table: "sessions");

        migrationBuilder.DropColumn(
            name: "SetupOnly",
            schema: "identity",
            table: "sessions");

        migrationBuilder.DropColumn(
            name: "LeaseId",
            schema: "messaging",
            table: "outbox");

        migrationBuilder.DropColumn(
            name: "LeaseUntil",
            schema: "messaging",
            table: "outbox");

        migrationBuilder.DropColumn(
            name: "LastTotpStep",
            schema: "identity",
            table: "AspNetUsers");
    }
}
