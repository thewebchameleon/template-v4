using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class RecordFileAssociations : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropPrimaryKey(
            name: "PK_attachments",
            schema: "support",
            table: "attachments");

        migrationBuilder.AddPrimaryKey(
            name: "PK_attachments2",
            schema: "support",
            table: "attachments",
            column: "Id");

        migrationBuilder.CreateTable(
            name: "attachments",
            schema: "crm",
            columns: table => new
            {
                OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                RecordId = table.Column<Guid>(type: "uuid", nullable: false),
                FileId = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_attachments", x => new { x.OrganizationId, x.RecordId, x.FileId });
            });

        migrationBuilder.CreateTable(
            name: "attachments",
            schema: "invoicing",
            columns: table => new
            {
                OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                RecordId = table.Column<Guid>(type: "uuid", nullable: false),
                FileId = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_attachments1", x => new { x.OrganizationId, x.RecordId, x.FileId });
            });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "attachments",
            schema: "crm");

        migrationBuilder.DropTable(
            name: "attachments",
            schema: "invoicing");

        migrationBuilder.DropPrimaryKey(
            name: "PK_attachments2",
            schema: "support",
            table: "attachments");

        migrationBuilder.AddPrimaryKey(
            name: "PK_attachments",
            schema: "support",
            table: "attachments",
            column: "Id");
    }
}
