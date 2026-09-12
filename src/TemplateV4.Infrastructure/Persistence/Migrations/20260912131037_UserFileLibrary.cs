using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UserFileLibrary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsFolder",
                schema: "app",
                table: "files",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "ParentId",
                schema: "app",
                table: "files",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "StorageQuotaBytes",
                schema: "identity",
                table: "AspNetUsers",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_files_Id_OwnerId",
                schema: "app",
                table: "files",
                columns: new[] { "Id", "OwnerId" });

            migrationBuilder.CreateTable(
                name: "file_storage_settings",
                schema: "app",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DefaultQuotaBytes = table.Column<long>(type: "bigint", nullable: false),
                    Version = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_file_storage_settings", x => x.Id);
                });

            migrationBuilder.InsertData(
                schema: "app",
                table: "file_storage_settings",
                columns: new[] { "Id", "DefaultQuotaBytes", "Version" },
                values: new object[] { 1, 104857600L, new Guid("df8c4bbd-18fb-45f8-8f13-a4c58a334660") });

            migrationBuilder.CreateIndex(
                name: "IX_files_OwnerId_ParentId",
                schema: "app",
                table: "files",
                columns: new[] { "OwnerId", "ParentId" });

            migrationBuilder.CreateIndex(
                name: "IX_files_ParentId_OwnerId",
                schema: "app",
                table: "files",
                columns: new[] { "ParentId", "OwnerId" });

            migrationBuilder.AddForeignKey(
                name: "FK_files_files_ParentId_OwnerId",
                schema: "app",
                table: "files",
                columns: new[] { "ParentId", "OwnerId" },
                principalSchema: "app",
                principalTable: "files",
                principalColumns: new[] { "Id", "OwnerId" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_files_files_ParentId_OwnerId",
                schema: "app",
                table: "files");

            migrationBuilder.DropTable(
                name: "file_storage_settings",
                schema: "app");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_files_Id_OwnerId",
                schema: "app",
                table: "files");

            migrationBuilder.DropIndex(
                name: "IX_files_OwnerId_ParentId",
                schema: "app",
                table: "files");

            migrationBuilder.DropIndex(
                name: "IX_files_ParentId_OwnerId",
                schema: "app",
                table: "files");

            migrationBuilder.DropColumn(
                name: "IsFolder",
                schema: "app",
                table: "files");

            migrationBuilder.DropColumn(
                name: "ParentId",
                schema: "app",
                table: "files");

            migrationBuilder.DropColumn(
                name: "StorageQuotaBytes",
                schema: "identity",
                table: "AspNetUsers");
        }
    }
}
