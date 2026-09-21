using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditSessionId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SessionId",
                schema: "audit",
                table: "entries",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_entries_SessionId_At",
                schema: "audit",
                table: "entries",
                columns: new[] { "SessionId", "At" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_entries_SessionId_At",
                schema: "audit",
                table: "entries");

            migrationBuilder.DropColumn(
                name: "SessionId",
                schema: "audit",
                table: "entries");
        }
    }
}
