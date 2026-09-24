using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.CommercialBilling.Infrastructure.Invoicing.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RetainInvoicePdfs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "document_pdfs",
                schema: "invoicing",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Reason = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Content = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_document_pdfs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_document_pdfs_documents_DocumentId",
                        column: x => x.DocumentId,
                        principalSchema: "invoicing",
                        principalTable: "documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_document_pdfs_DocumentId_Version",
                schema: "invoicing",
                table: "document_pdfs",
                columns: new[] { "DocumentId", "Version" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "document_pdfs",
                schema: "invoicing");
        }
    }
}
