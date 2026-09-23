using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SharedOrganisationFiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_organisation_files_CustomerId_CreatedAt",
                schema: "files",
                table: "organisation_files");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                schema: "files",
                table: "organisation_files");

            migrationBuilder.CreateIndex(
                name: "IX_organisation_files_CreatedAt",
                schema: "files",
                table: "organisation_files",
                column: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_organisation_files_CreatedAt",
                schema: "files",
                table: "organisation_files");

            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId",
                schema: "files",
                table: "organisation_files",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_organisation_files_CustomerId_CreatedAt",
                schema: "files",
                table: "organisation_files",
                columns: new[] { "CustomerId", "CreatedAt" });
        }
    }
}
