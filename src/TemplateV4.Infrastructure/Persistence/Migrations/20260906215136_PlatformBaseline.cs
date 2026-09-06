using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class PlatformBaseline : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "InvitationAcceptedAt",
            schema: "identity",
            table: "AspNetUsers",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "InvitationCancelledAt",
            schema: "identity",
            table: "AspNetUsers",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "InvitationExpiresAt",
            schema: "identity",
            table: "AspNetUsers",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "InvitationSentAt",
            schema: "identity",
            table: "AspNetUsers",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "OptionalEmailEnabled",
            schema: "identity",
            table: "AspNetUsers",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.CreateTable(
            name: "deletion_requests",
            schema: "app",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                State = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                RequestedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                ReviewedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                ReviewedBy = table.Column<Guid>(type: "uuid", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_deletion_requests", x => x.Id);
                table.ForeignKey(
                    name: "FK_deletion_requests_AspNetUsers_UserId",
                    column: x => x.UserId,
                    principalSchema: "identity",
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "files",
            schema: "app",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                OwnerId = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                ContentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                Size = table.Column<long>(type: "bigint", nullable: false),
                CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                PurgedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                Ready = table.Column<bool>(type: "boolean", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_files", x => x.Id);
                table.ForeignKey(
                    name: "FK_files_AspNetUsers_OwnerId",
                    column: x => x.OwnerId,
                    principalSchema: "identity",
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "notifications",
            schema: "app",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                Kind = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                Link = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                ReadAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_notifications", x => x.Id);
                table.ForeignKey(
                    name: "FK_notifications_AspNetUsers_UserId",
                    column: x => x.UserId,
                    principalSchema: "identity",
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_entries_ActorId_At",
            schema: "audit",
            table: "entries",
            columns: new[] { "ActorId", "At" });

        migrationBuilder.CreateIndex(
            name: "IX_entries_At_Id",
            schema: "audit",
            table: "entries",
            columns: new[] { "At", "Id" });

        migrationBuilder.CreateIndex(
            name: "IX_deletion_requests_State_RequestedAt",
            schema: "app",
            table: "deletion_requests",
            columns: new[] { "State", "RequestedAt" });

        migrationBuilder.CreateIndex(
            name: "IX_deletion_requests_UserId",
            schema: "app",
            table: "deletion_requests",
            column: "UserId",
            unique: true,
            filter: "\"State\" = 'Pending'");

        migrationBuilder.CreateIndex(
            name: "IX_files_DeletedAt",
            schema: "app",
            table: "files",
            column: "DeletedAt");

        migrationBuilder.CreateIndex(
            name: "IX_files_OwnerId_CreatedAt",
            schema: "app",
            table: "files",
            columns: new[] { "OwnerId", "CreatedAt" });

        migrationBuilder.CreateIndex(
            name: "IX_notifications_UserId_CreatedAt",
            schema: "app",
            table: "notifications",
            columns: new[] { "UserId", "CreatedAt" });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "deletion_requests",
            schema: "app");

        migrationBuilder.DropTable(
            name: "files",
            schema: "app");

        migrationBuilder.DropTable(
            name: "notifications",
            schema: "app");

        migrationBuilder.DropIndex(
            name: "IX_entries_ActorId_At",
            schema: "audit",
            table: "entries");

        migrationBuilder.DropIndex(
            name: "IX_entries_At_Id",
            schema: "audit",
            table: "entries");

        migrationBuilder.DropColumn(
            name: "InvitationAcceptedAt",
            schema: "identity",
            table: "AspNetUsers");

        migrationBuilder.DropColumn(
            name: "InvitationCancelledAt",
            schema: "identity",
            table: "AspNetUsers");

        migrationBuilder.DropColumn(
            name: "InvitationExpiresAt",
            schema: "identity",
            table: "AspNetUsers");

        migrationBuilder.DropColumn(
            name: "InvitationSentAt",
            schema: "identity",
            table: "AspNetUsers");

        migrationBuilder.DropColumn(
            name: "OptionalEmailEnabled",
            schema: "identity",
            table: "AspNetUsers");
    }
}
