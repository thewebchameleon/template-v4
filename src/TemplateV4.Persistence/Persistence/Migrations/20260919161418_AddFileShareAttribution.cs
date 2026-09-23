using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddFileShareAttribution : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SharedById",
                schema: "file_storage",
                table: "file_shares",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_file_shares_SharedById",
                schema: "file_storage",
                table: "file_shares",
                column: "SharedById");

            migrationBuilder.AddForeignKey(
                name: "FK_file_shares_AspNetUsers_SharedById",
                schema: "file_storage",
                table: "file_shares",
                column: "SharedById",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_file_shares_AspNetUsers_SharedById",
                schema: "file_storage",
                table: "file_shares");

            migrationBuilder.DropIndex(
                name: "IX_file_shares_SharedById",
                schema: "file_storage",
                table: "file_shares");

            migrationBuilder.DropColumn(
                name: "SharedById",
                schema: "file_storage",
                table: "file_shares");
        }
    }
}
