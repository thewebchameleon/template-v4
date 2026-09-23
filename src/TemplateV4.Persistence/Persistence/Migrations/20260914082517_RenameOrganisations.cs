using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RenameOrganisations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_entries_documents_OrganizationId_DocumentId",
                schema: "invoicing",
                table: "entries");

            migrationBuilder.DropForeignKey(
                name: "FK_notes_records_OrganizationId_RecordId",
                schema: "crm",
                table: "notes");

            migrationBuilder.Sql("ALTER TABLE files.organization_files RENAME TO organisation_files; ALTER TABLE files.organisation_files RENAME CONSTRAINT \"PK_organization_files\" TO \"PK_organisation_files\"; ALTER INDEX files.\"IX_organization_files_CustomerId_CreatedAt\" RENAME TO \"IX_organisation_files_CustomerId_CreatedAt\"; ALTER INDEX files.\"IX_organization_files_DeletedAt\" RENAME TO \"IX_organisation_files_DeletedAt\";");

            migrationBuilder.Sql("ALTER SCHEMA organizations RENAME TO organisations;");
            migrationBuilder.Sql("""
                UPDATE billing.settings SET "Ownership" = 'Organisation' WHERE "Ownership" = 'Organization';
                UPDATE app.notifications SET "Kind" = 'notificationOrganisation' WHERE "Kind" = 'notificationOrganization';
                UPDATE app.notifications SET "Link" = '/organisations' || substring("Link" from 15)
                WHERE "Link" = '/organizations' OR "Link" LIKE '/organizations/%' OR "Link" LIKE '/organizations?%';
                """);

            migrationBuilder.RenameColumn(
                name: "OrganizationId",
                schema: "crm",
                table: "records",
                newName: "OrganisationId");

            migrationBuilder.RenameIndex(
                name: "IX_records_OrganizationId_Kind_Archived_Name_Id",
                schema: "crm",
                table: "records",
                newName: "IX_records_OrganisationId_Kind_Archived_Name_Id");

            migrationBuilder.RenameColumn(
                name: "OrganizationId",
                schema: "invoicing",
                table: "operations",
                newName: "OrganisationId");

            migrationBuilder.RenameColumn(
                name: "OrganizationId",
                schema: "crm",
                table: "notes",
                newName: "OrganisationId");

            migrationBuilder.RenameIndex(
                name: "IX_notes_OrganizationId_RecordId_At",
                schema: "crm",
                table: "notes",
                newName: "IX_notes_OrganisationId_RecordId_At");

            migrationBuilder.RenameColumn(
                name: "OrganizationId",
                schema: "invoicing",
                table: "issuer_settings",
                newName: "OrganisationId");

            migrationBuilder.RenameColumn(
                name: "OrganizationId",
                schema: "invoicing",
                table: "entries",
                newName: "OrganisationId");

            migrationBuilder.RenameIndex(
                name: "IX_entries_OrganizationId_DocumentId",
                schema: "invoicing",
                table: "entries",
                newName: "IX_entries_OrganisationId_DocumentId");

            migrationBuilder.RenameColumn(
                name: "OrganizationId",
                schema: "invoicing",
                table: "documents",
                newName: "OrganisationId");

            migrationBuilder.RenameIndex(
                name: "IX_documents_OrganizationId_OriginModule_OriginType_OriginId",
                schema: "invoicing",
                table: "documents",
                newName: "IX_documents_OrganisationId_OriginModule_OriginType_OriginId");

            migrationBuilder.RenameIndex(
                name: "IX_documents_OrganizationId_Number",
                schema: "invoicing",
                table: "documents",
                newName: "IX_documents_OrganisationId_Number");

            migrationBuilder.RenameIndex(
                name: "IX_documents_OrganizationId_IssuedAt_Id",
                schema: "invoicing",
                table: "documents",
                newName: "IX_documents_OrganisationId_IssuedAt_Id");

            migrationBuilder.RenameColumn(
                name: "OrganizationId",
                schema: "crm",
                table: "configuration",
                newName: "OrganisationId");

            migrationBuilder.RenameColumn(
                name: "OrganizationId",
                schema: "invoicing",
                table: "attachments",
                newName: "OrganisationId");

            migrationBuilder.RenameColumn(
                name: "OrganizationId",
                schema: "crm",
                table: "attachments",
                newName: "OrganisationId");

            migrationBuilder.AddForeignKey(
                name: "FK_entries_documents_OrganisationId_DocumentId",
                schema: "invoicing",
                table: "entries",
                columns: new[] { "OrganisationId", "DocumentId" },
                principalSchema: "invoicing",
                principalTable: "documents",
                principalColumns: new[] { "OrganisationId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_notes_records_OrganisationId_RecordId",
                schema: "crm",
                table: "notes",
                columns: new[] { "OrganisationId", "RecordId" },
                principalSchema: "crm",
                principalTable: "records",
                principalColumns: new[] { "OrganisationId", "Id" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_entries_documents_OrganisationId_DocumentId",
                schema: "invoicing",
                table: "entries");

            migrationBuilder.DropForeignKey(
                name: "FK_notes_records_OrganisationId_RecordId",
                schema: "crm",
                table: "notes");

            migrationBuilder.Sql("ALTER TABLE files.organisation_files RENAME TO organization_files; ALTER TABLE files.organization_files RENAME CONSTRAINT \"PK_organisation_files\" TO \"PK_organization_files\"; ALTER INDEX files.\"IX_organisation_files_CustomerId_CreatedAt\" RENAME TO \"IX_organization_files_CustomerId_CreatedAt\"; ALTER INDEX files.\"IX_organisation_files_DeletedAt\" RENAME TO \"IX_organization_files_DeletedAt\";");

            migrationBuilder.Sql("ALTER SCHEMA organisations RENAME TO organizations;");
            migrationBuilder.Sql("""
                UPDATE billing.settings SET "Ownership" = 'Organization' WHERE "Ownership" = 'Organisation';
                UPDATE app.notifications SET "Kind" = 'notificationOrganization' WHERE "Kind" = 'notificationOrganisation';
                UPDATE app.notifications SET "Link" = '/organizations' || substring("Link" from 15)
                WHERE "Link" = '/organisations' OR "Link" LIKE '/organisations/%' OR "Link" LIKE '/organisations?%';
                """);

            migrationBuilder.RenameColumn(
                name: "OrganisationId",
                schema: "crm",
                table: "records",
                newName: "OrganizationId");

            migrationBuilder.RenameIndex(
                name: "IX_records_OrganisationId_Kind_Archived_Name_Id",
                schema: "crm",
                table: "records",
                newName: "IX_records_OrganizationId_Kind_Archived_Name_Id");

            migrationBuilder.RenameColumn(
                name: "OrganisationId",
                schema: "invoicing",
                table: "operations",
                newName: "OrganizationId");

            migrationBuilder.RenameColumn(
                name: "OrganisationId",
                schema: "crm",
                table: "notes",
                newName: "OrganizationId");

            migrationBuilder.RenameIndex(
                name: "IX_notes_OrganisationId_RecordId_At",
                schema: "crm",
                table: "notes",
                newName: "IX_notes_OrganizationId_RecordId_At");

            migrationBuilder.RenameColumn(
                name: "OrganisationId",
                schema: "invoicing",
                table: "issuer_settings",
                newName: "OrganizationId");

            migrationBuilder.RenameColumn(
                name: "OrganisationId",
                schema: "invoicing",
                table: "entries",
                newName: "OrganizationId");

            migrationBuilder.RenameIndex(
                name: "IX_entries_OrganisationId_DocumentId",
                schema: "invoicing",
                table: "entries",
                newName: "IX_entries_OrganizationId_DocumentId");

            migrationBuilder.RenameColumn(
                name: "OrganisationId",
                schema: "invoicing",
                table: "documents",
                newName: "OrganizationId");

            migrationBuilder.RenameIndex(
                name: "IX_documents_OrganisationId_OriginModule_OriginType_OriginId",
                schema: "invoicing",
                table: "documents",
                newName: "IX_documents_OrganizationId_OriginModule_OriginType_OriginId");

            migrationBuilder.RenameIndex(
                name: "IX_documents_OrganisationId_Number",
                schema: "invoicing",
                table: "documents",
                newName: "IX_documents_OrganizationId_Number");

            migrationBuilder.RenameIndex(
                name: "IX_documents_OrganisationId_IssuedAt_Id",
                schema: "invoicing",
                table: "documents",
                newName: "IX_documents_OrganizationId_IssuedAt_Id");

            migrationBuilder.RenameColumn(
                name: "OrganisationId",
                schema: "crm",
                table: "configuration",
                newName: "OrganizationId");

            migrationBuilder.RenameColumn(
                name: "OrganisationId",
                schema: "invoicing",
                table: "attachments",
                newName: "OrganizationId");

            migrationBuilder.RenameColumn(
                name: "OrganisationId",
                schema: "crm",
                table: "attachments",
                newName: "OrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_entries_documents_OrganizationId_DocumentId",
                schema: "invoicing",
                table: "entries",
                columns: new[] { "OrganizationId", "DocumentId" },
                principalSchema: "invoicing",
                principalTable: "documents",
                principalColumns: new[] { "OrganizationId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_notes_records_OrganizationId_RecordId",
                schema: "crm",
                table: "notes",
                columns: new[] { "OrganizationId", "RecordId" },
                principalSchema: "crm",
                principalTable: "records",
                principalColumns: new[] { "OrganizationId", "Id" },
                onDelete: ReferentialAction.Restrict);
        }
    }
}
