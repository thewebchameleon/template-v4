using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class MyFilesLibrary : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Description",
            schema: "files",
            table: "files",
            type: "character varying(4000)",
            maxLength: 4000,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<bool>(
            name: "Important",
            schema: "files",
            table: "files",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<bool>(
            name: "PurgeRequested",
            schema: "files",
            table: "files",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<bool>(
            name: "Starred",
            schema: "files",
            table: "files",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "Tags",
            schema: "files",
            table: "files",
            type: "character varying(1000)",
            maxLength: 1000,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<Guid>(
            name: "TrashBatchId",
            schema: "files",
            table: "files",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "UpdatedAt",
            schema: "files",
            table: "files",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "DemoExpiryMinutes",
            schema: "files",
            table: "file_storage_settings",
            type: "integer",
            nullable: false,
            defaultValue: 60);

        migrationBuilder.AddColumn<bool>(
            name: "DemoMode",
            schema: "files",
            table: "file_storage_settings",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "DemoStartedAt",
            schema: "files",
            table: "file_storage_settings",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "my_file_shares",
            schema: "files",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                FileId = table.Column<Guid>(type: "uuid", nullable: false),
                RecipientId = table.Column<Guid>(type: "uuid", nullable: true),
                TokenHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                Permission = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: false),
                ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_my_file_shares", x => x.Id);
                table.ForeignKey(
                    name: "FK_my_file_shares_AspNetUsers_RecipientId",
                    column: x => x.RecipientId,
                    principalSchema: "identity",
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_my_file_shares_files_FileId",
                    column: x => x.FileId,
                    principalSchema: "files",
                    principalTable: "files",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.UpdateData(
            schema: "files",
            table: "file_storage_settings",
            keyColumn: "Id",
            keyValue: 1,
            columns: new[] { "DemoExpiryMinutes", "DemoMode", "DemoStartedAt" },
            values: new object[] { 60, false, null });

        migrationBuilder.CreateIndex(
            name: "IX_my_file_shares_FileId",
            schema: "files",
            table: "my_file_shares",
            column: "FileId");

        migrationBuilder.CreateIndex(
            name: "IX_my_file_shares_RecipientId",
            schema: "files",
            table: "my_file_shares",
            column: "RecipientId");

        migrationBuilder.CreateIndex(
            name: "IX_my_file_shares_TokenHash",
            schema: "files",
            table: "my_file_shares",
            column: "TokenHash",
            unique: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "my_file_shares",
            schema: "files");

        migrationBuilder.DropColumn(
            name: "Description",
            schema: "files",
            table: "files");

        migrationBuilder.DropColumn(
            name: "Important",
            schema: "files",
            table: "files");

        migrationBuilder.DropColumn(
            name: "PurgeRequested",
            schema: "files",
            table: "files");

        migrationBuilder.DropColumn(
            name: "Starred",
            schema: "files",
            table: "files");

        migrationBuilder.DropColumn(
            name: "Tags",
            schema: "files",
            table: "files");

        migrationBuilder.DropColumn(
            name: "TrashBatchId",
            schema: "files",
            table: "files");

        migrationBuilder.DropColumn(
            name: "UpdatedAt",
            schema: "files",
            table: "files");

        migrationBuilder.DropColumn(
            name: "DemoExpiryMinutes",
            schema: "files",
            table: "file_storage_settings");

        migrationBuilder.DropColumn(
            name: "DemoMode",
            schema: "files",
            table: "file_storage_settings");

        migrationBuilder.DropColumn(
            name: "DemoStartedAt",
            schema: "files",
            table: "file_storage_settings");

    }
}
