using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TemplateV4.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class CrmAndCommercialDocuments : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropPrimaryKey(
            name: "PK_entries",
            schema: "audit",
            table: "entries");

        migrationBuilder.EnsureSchema(
            name: "crm");

        migrationBuilder.EnsureSchema(
            name: "invoicing");

        migrationBuilder.AddPrimaryKey(
            name: "PK_entries1",
            schema: "audit",
            table: "entries",
            column: "Id");

        migrationBuilder.CreateTable(
            name: "configuration",
            schema: "crm",
            columns: table => new
            {
                OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                Version = table.Column<Guid>(type: "uuid", nullable: false),
                Data = table.Column<string>(type: "jsonb", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_configuration", x => x.OrganizationId);
            });

        migrationBuilder.CreateTable(
            name: "documents",
            schema: "invoicing",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                Version = table.Column<Guid>(type: "uuid", nullable: false),
                Number = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                Kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                CustomerName = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                Snapshot = table.Column<string>(type: "jsonb", nullable: false),
                Total = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                Credits = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                Paid = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                Refunded = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                IssuedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                ActorId = table.Column<Guid>(type: "uuid", nullable: false),
                OriginModule = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                OriginType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                OriginId = table.Column<Guid>(type: "uuid", nullable: true),
                QuotationId = table.Column<Guid>(type: "uuid", nullable: true),
                PreviousRevisionId = table.Column<Guid>(type: "uuid", nullable: true),
                CorrectsId = table.Column<Guid>(type: "uuid", nullable: true),
                Accepted = table.Column<bool>(type: "boolean", nullable: false),
                AcceptedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                AcceptanceReference = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                AcceptedBy = table.Column<Guid>(type: "uuid", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_documents", x => new { x.OrganizationId, x.Id });
            });

        migrationBuilder.CreateTable(
            name: "issuer_settings",
            schema: "invoicing",
            columns: table => new
            {
                OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                Version = table.Column<Guid>(type: "uuid", nullable: false),
                NextNumber = table.Column<long>(type: "bigint", nullable: false),
                Data = table.Column<string>(type: "jsonb", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_issuer_settings", x => x.OrganizationId);
            });

        migrationBuilder.CreateTable(
            name: "operations",
            schema: "invoicing",
            columns: table => new
            {
                OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                Key = table.Column<Guid>(type: "uuid", nullable: false),
                Fingerprint = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                ResultId = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_operations", x => new { x.OrganizationId, x.Key });
            });

        migrationBuilder.CreateTable(
            name: "records",
            schema: "crm",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                Version = table.Column<Guid>(type: "uuid", nullable: false),
                Kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                Name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                Email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                Outcome = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                Value = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                Archived = table.Column<bool>(type: "boolean", nullable: false),
                CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                Data = table.Column<string>(type: "jsonb", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_records", x => new { x.OrganizationId, x.Id });
            });

        migrationBuilder.CreateTable(
            name: "entries",
            schema: "invoicing",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                DocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                Kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                Reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                Method = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                Date = table.Column<DateOnly>(type: "date", nullable: false),
                Reference = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                ActorId = table.Column<Guid>(type: "uuid", nullable: false),
                At = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                IssuedDocumentId = table.Column<Guid>(type: "uuid", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_entries", x => new { x.OrganizationId, x.Id });
                table.ForeignKey(
                    name: "FK_entries_documents_OrganizationId_DocumentId",
                    columns: x => new { x.OrganizationId, x.DocumentId },
                    principalSchema: "invoicing",
                    principalTable: "documents",
                    principalColumns: new[] { "OrganizationId", "Id" },
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "notes",
            schema: "crm",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                RecordId = table.Column<Guid>(type: "uuid", nullable: false),
                ActorId = table.Column<Guid>(type: "uuid", nullable: false),
                Text = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                At = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_notes", x => new { x.OrganizationId, x.Id });
                table.ForeignKey(
                    name: "FK_notes_records_OrganizationId_RecordId",
                    columns: x => new { x.OrganizationId, x.RecordId },
                    principalSchema: "crm",
                    principalTable: "records",
                    principalColumns: new[] { "OrganizationId", "Id" },
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.InsertData(
            schema: "app",
            table: "runtime_modules",
            columns: new[] { "Id", "Enabled", "Version" },
            values: new object[,]
            {
                { "crm", true, new Guid("34c03708-6e53-4c4b-8bfa-d79ed6744c9c") },
                { "invoicing", true, new Guid("9b06f2a7-1f29-4f29-887f-c0836dc6f383") }
            });

        migrationBuilder.CreateIndex(
            name: "IX_documents_OrganizationId_IssuedAt_Id",
            schema: "invoicing",
            table: "documents",
            columns: new[] { "OrganizationId", "IssuedAt", "Id" });

        migrationBuilder.CreateIndex(
            name: "IX_documents_OrganizationId_Number",
            schema: "invoicing",
            table: "documents",
            columns: new[] { "OrganizationId", "Number" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_documents_OrganizationId_OriginModule_OriginType_OriginId",
            schema: "invoicing",
            table: "documents",
            columns: new[] { "OrganizationId", "OriginModule", "OriginType", "OriginId" },
            unique: true,
            filter: "\"Kind\" = 'Invoice' AND \"OriginId\" IS NOT NULL");

        migrationBuilder.CreateIndex(
            name: "IX_entries_OrganizationId_DocumentId",
            schema: "invoicing",
            table: "entries",
            columns: new[] { "OrganizationId", "DocumentId" });

        migrationBuilder.CreateIndex(
            name: "IX_notes_OrganizationId_RecordId_At",
            schema: "crm",
            table: "notes",
            columns: new[] { "OrganizationId", "RecordId", "At" });

        migrationBuilder.CreateIndex(
            name: "IX_records_OrganizationId_Kind_Archived_Name_Id",
            schema: "crm",
            table: "records",
            columns: new[] { "OrganizationId", "Kind", "Archived", "Name", "Id" });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "configuration",
            schema: "crm");

        migrationBuilder.DropTable(
            name: "entries",
            schema: "invoicing");

        migrationBuilder.DropTable(
            name: "issuer_settings",
            schema: "invoicing");

        migrationBuilder.DropTable(
            name: "notes",
            schema: "crm");

        migrationBuilder.DropTable(
            name: "operations",
            schema: "invoicing");

        migrationBuilder.DropTable(
            name: "documents",
            schema: "invoicing");

        migrationBuilder.DropTable(
            name: "records",
            schema: "crm");

        migrationBuilder.DropPrimaryKey(
            name: "PK_entries1",
            schema: "audit",
            table: "entries");

        migrationBuilder.DeleteData(
            schema: "app",
            table: "runtime_modules",
            keyColumn: "Id",
            keyValue: "crm");

        migrationBuilder.DeleteData(
            schema: "app",
            table: "runtime_modules",
            keyColumn: "Id",
            keyValue: "invoicing");

        migrationBuilder.AddPrimaryKey(
            name: "PK_entries",
            schema: "audit",
            table: "entries",
            column: "Id");
    }
}
