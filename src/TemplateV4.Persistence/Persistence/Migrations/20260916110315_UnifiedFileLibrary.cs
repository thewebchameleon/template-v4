using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UnifiedFileLibrary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_files_files_ParentId_OwnerId",
                schema: "files",
                table: "files");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_files_Id_OwnerId",
                schema: "files",
                table: "files");

            migrationBuilder.DropIndex(
                name: "IX_files_ParentId_OwnerId",
                schema: "files",
                table: "files");

            migrationBuilder.AlterColumn<Guid>(
                name: "OwnerId",
                schema: "files",
                table: "files",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<string>(
                name: "StorageKey",
                schema: "files",
                table: "files",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Preserve IDs and object keys so record attachments and stored bytes remain valid.
            migrationBuilder.Sql("""
                INSERT INTO files.files ("Id", "OwnerId", "ParentId", "IsFolder", "Name", "Description", "Tags", "Important", "Starred", "UpdatedAt", "TrashBatchId", "PurgeRequested", "ContentType", "Size", "CreatedAt", "DeletedAt", "PurgedAt", "PurgeRetryAt", "Ready", "StorageKey")
                SELECT f."Id", u."Id", NULL, FALSE, f."Name", '', '', FALSE, FALSE, NULL, NULL, FALSE, 'application/octet-stream', f."Size", f."CreatedAt", f."DeletedAt", f."PurgedAt", f."PurgeRetryAt", f."Ready", '00000000000000000000000000000001-' || replace(f."Id"::text, '-', '')
                FROM files.organisation_files f LEFT JOIN identity."AspNetUsers" u ON u."Id" = f."UploadedBy";
                -- Merging libraries must not newly opt organisation documents into demo deletion.
                UPDATE files.file_storage_settings SET "DemoMode" = FALSE, "DemoStartedAt" = NULL, "Version" = gen_random_uuid() WHERE "DemoMode";
                """);

            migrationBuilder.DropTable(
                name: "organisation_files",
                schema: "files");

            migrationBuilder.CreateIndex(
                name: "IX_files_ParentId",
                schema: "files",
                table: "files",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_files_files_ParentId",
                schema: "files",
                table: "files",
                column: "ParentId",
                principalSchema: "files",
                principalTable: "files",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            throw new NotSupportedException("The organisation file merge cannot be reversed without restoring a backup. Use a forward migration.");
        }
    }
}
