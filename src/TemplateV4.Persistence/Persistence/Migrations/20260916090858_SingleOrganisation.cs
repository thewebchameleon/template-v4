using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SingleOrganisation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_customers_AspNetUsers_PersonalUserId",
                schema: "organisations",
                table: "customers");

            migrationBuilder.DropForeignKey(
                name: "FK_entries_documents_OrganisationId_DocumentId",
                schema: "invoicing",
                table: "entries");

            migrationBuilder.DropForeignKey(
                name: "FK_notes_records_OrganisationId_RecordId",
                schema: "crm",
                table: "notes");

            migrationBuilder.DropTable(
                name: "invitations",
                schema: "organisations");

            migrationBuilder.DropTable(
                name: "memberships",
                schema: "organisations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_records",
                schema: "crm",
                table: "records");

            migrationBuilder.DropIndex(
                name: "IX_records_OrganisationId_Kind_Archived_Name_Id",
                schema: "crm",
                table: "records");

            migrationBuilder.DropPrimaryKey(
                name: "PK_operations",
                schema: "invoicing",
                table: "operations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_notes",
                schema: "crm",
                table: "notes");

            migrationBuilder.DropIndex(
                name: "IX_notes_OrganisationId_RecordId_At",
                schema: "crm",
                table: "notes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_issuer_settings",
                schema: "invoicing",
                table: "issuer_settings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_entries",
                schema: "invoicing",
                table: "entries");

            migrationBuilder.DropIndex(
                name: "IX_entries_OrganisationId_DocumentId",
                schema: "invoicing",
                table: "entries");

            migrationBuilder.DropPrimaryKey(
                name: "PK_documents",
                schema: "invoicing",
                table: "documents");

            migrationBuilder.DropIndex(
                name: "IX_documents_OrganisationId_IssuedAt_Id",
                schema: "invoicing",
                table: "documents");

            migrationBuilder.DropIndex(
                name: "IX_documents_OrganisationId_Number",
                schema: "invoicing",
                table: "documents");

            migrationBuilder.DropIndex(
                name: "IX_documents_OrganisationId_OriginModule_OriginType_OriginId",
                schema: "invoicing",
                table: "documents");

            migrationBuilder.DropIndex(
                name: "IX_customers_PersonalUserId",
                schema: "organisations",
                table: "customers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_configuration",
                schema: "crm",
                table: "configuration");

            migrationBuilder.DropPrimaryKey(
                name: "PK_attachments1",
                schema: "invoicing",
                table: "attachments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_attachments",
                schema: "crm",
                table: "attachments");

            migrationBuilder.DropColumn(
                name: "Ownership",
                schema: "billing",
                table: "settings");

            migrationBuilder.DropColumn(
                name: "OrganisationId",
                schema: "crm",
                table: "records");

            migrationBuilder.DropColumn(
                name: "OrganisationId",
                schema: "invoicing",
                table: "operations");

            migrationBuilder.DropColumn(
                name: "OrganisationId",
                schema: "crm",
                table: "notes");

            migrationBuilder.DropColumn(
                name: "OrganisationId",
                schema: "invoicing",
                table: "issuer_settings");

            migrationBuilder.DropColumn(
                name: "OrganisationId",
                schema: "invoicing",
                table: "entries");

            migrationBuilder.DropColumn(
                name: "OrganisationId",
                schema: "invoicing",
                table: "documents");

            migrationBuilder.DropColumn(
                name: "ClosedAt",
                schema: "organisations",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "PersonalUserId",
                schema: "organisations",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "OrganisationId",
                schema: "crm",
                table: "configuration");

            migrationBuilder.DropColumn(
                name: "OrganisationId",
                schema: "invoicing",
                table: "attachments");

            migrationBuilder.DropColumn(
                name: "OrganisationId",
                schema: "crm",
                table: "attachments");

            migrationBuilder.DropColumn(
                name: "CurrentOrganisationId",
                schema: "identity",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                schema: "invoicing",
                table: "issuer_settings",
                type: "integer",
                nullable: false,
                defaultValue: 0)
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<int>(
                name: "Id",
                schema: "crm",
                table: "configuration",
                type: "integer",
                nullable: false,
                defaultValue: 0)
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddPrimaryKey(
                name: "PK_records",
                schema: "crm",
                table: "records",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_operations",
                schema: "invoicing",
                table: "operations",
                column: "Key");

            migrationBuilder.AddPrimaryKey(
                name: "PK_notes",
                schema: "crm",
                table: "notes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_issuer_settings",
                schema: "invoicing",
                table: "issuer_settings",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_entries",
                schema: "invoicing",
                table: "entries",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_documents",
                schema: "invoicing",
                table: "documents",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_configuration",
                schema: "crm",
                table: "configuration",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_attachments1",
                schema: "invoicing",
                table: "attachments",
                columns: new[] { "RecordId", "FileId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_attachments",
                schema: "crm",
                table: "attachments",
                columns: new[] { "RecordId", "FileId" });

            migrationBuilder.InsertData(
                schema: "organisations",
                table: "customers",
                columns: new[] { "Id", "Name", "Version" },
                values: new object[] { new Guid("00000000-0000-0000-0000-000000000001"), "Organisation", new Guid("d473876e-a68f-4d80-8c97-ccdddcddbcdb") });

            migrationBuilder.AddCheckConstraint(
                name: "CK_subscription_singleton",
                schema: "billing",
                table: "subscriptions",
                sql: "\"CustomerId\" = '00000000-0000-0000-0000-000000000001'::uuid");

            migrationBuilder.CreateIndex(
                name: "IX_records_Kind_Archived_Name_Id",
                schema: "crm",
                table: "records",
                columns: new[] { "Kind", "Archived", "Name", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_notes_RecordId_At",
                schema: "crm",
                table: "notes",
                columns: new[] { "RecordId", "At" });

            migrationBuilder.AddCheckConstraint(
                name: "CK_issuer_settings_singleton",
                schema: "invoicing",
                table: "issuer_settings",
                sql: "\"Id\" = 1");

            migrationBuilder.CreateIndex(
                name: "IX_entries_DocumentId",
                schema: "invoicing",
                table: "entries",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_documents_IssuedAt_Id",
                schema: "invoicing",
                table: "documents",
                columns: new[] { "IssuedAt", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_documents_Number",
                schema: "invoicing",
                table: "documents",
                column: "Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_documents_OriginModule_OriginType_OriginId",
                schema: "invoicing",
                table: "documents",
                columns: new[] { "OriginModule", "OriginType", "OriginId" },
                unique: true,
                filter: "\"Kind\" = 'Invoice' AND \"OriginId\" IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_organisation_singleton",
                schema: "organisations",
                table: "customers",
                sql: "\"Id\" = '00000000-0000-0000-0000-000000000001'::uuid");

            migrationBuilder.AddCheckConstraint(
                name: "CK_crm_configuration_singleton",
                schema: "crm",
                table: "configuration",
                sql: "\"Id\" = 1");

            migrationBuilder.AddForeignKey(
                name: "FK_entries_documents_DocumentId",
                schema: "invoicing",
                table: "entries",
                column: "DocumentId",
                principalSchema: "invoicing",
                principalTable: "documents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_notes_records_RecordId",
                schema: "crm",
                table: "notes",
                column: "RecordId",
                principalSchema: "crm",
                principalTable: "records",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_entries_documents_DocumentId",
                schema: "invoicing",
                table: "entries");

            migrationBuilder.DropForeignKey(
                name: "FK_notes_records_RecordId",
                schema: "crm",
                table: "notes");

            migrationBuilder.DropCheckConstraint(
                name: "CK_subscription_singleton",
                schema: "billing",
                table: "subscriptions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_records",
                schema: "crm",
                table: "records");

            migrationBuilder.DropIndex(
                name: "IX_records_Kind_Archived_Name_Id",
                schema: "crm",
                table: "records");

            migrationBuilder.DropPrimaryKey(
                name: "PK_operations",
                schema: "invoicing",
                table: "operations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_notes",
                schema: "crm",
                table: "notes");

            migrationBuilder.DropIndex(
                name: "IX_notes_RecordId_At",
                schema: "crm",
                table: "notes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_issuer_settings",
                schema: "invoicing",
                table: "issuer_settings");

            migrationBuilder.DropCheckConstraint(
                name: "CK_issuer_settings_singleton",
                schema: "invoicing",
                table: "issuer_settings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_entries",
                schema: "invoicing",
                table: "entries");

            migrationBuilder.DropIndex(
                name: "IX_entries_DocumentId",
                schema: "invoicing",
                table: "entries");

            migrationBuilder.DropPrimaryKey(
                name: "PK_documents",
                schema: "invoicing",
                table: "documents");

            migrationBuilder.DropIndex(
                name: "IX_documents_IssuedAt_Id",
                schema: "invoicing",
                table: "documents");

            migrationBuilder.DropIndex(
                name: "IX_documents_Number",
                schema: "invoicing",
                table: "documents");

            migrationBuilder.DropIndex(
                name: "IX_documents_OriginModule_OriginType_OriginId",
                schema: "invoicing",
                table: "documents");

            migrationBuilder.DropCheckConstraint(
                name: "CK_organisation_singleton",
                schema: "organisations",
                table: "customers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_configuration",
                schema: "crm",
                table: "configuration");

            migrationBuilder.DropCheckConstraint(
                name: "CK_crm_configuration_singleton",
                schema: "crm",
                table: "configuration");

            migrationBuilder.DropPrimaryKey(
                name: "PK_attachments1",
                schema: "invoicing",
                table: "attachments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_attachments",
                schema: "crm",
                table: "attachments");

            migrationBuilder.DeleteData(
                schema: "organisations",
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.DropColumn(
                name: "Id",
                schema: "invoicing",
                table: "issuer_settings");

            migrationBuilder.DropColumn(
                name: "Id",
                schema: "crm",
                table: "configuration");

            migrationBuilder.AddColumn<string>(
                name: "Ownership",
                schema: "billing",
                table: "settings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "OrganisationId",
                schema: "crm",
                table: "records",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "OrganisationId",
                schema: "invoicing",
                table: "operations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "OrganisationId",
                schema: "crm",
                table: "notes",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "OrganisationId",
                schema: "invoicing",
                table: "issuer_settings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "OrganisationId",
                schema: "invoicing",
                table: "entries",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "OrganisationId",
                schema: "invoicing",
                table: "documents",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ClosedAt",
                schema: "organisations",
                table: "customers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PersonalUserId",
                schema: "organisations",
                table: "customers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganisationId",
                schema: "crm",
                table: "configuration",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "OrganisationId",
                schema: "invoicing",
                table: "attachments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "OrganisationId",
                schema: "crm",
                table: "attachments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "CurrentOrganisationId",
                schema: "identity",
                table: "AspNetUsers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_records",
                schema: "crm",
                table: "records",
                columns: new[] { "OrganisationId", "Id" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_operations",
                schema: "invoicing",
                table: "operations",
                columns: new[] { "OrganisationId", "Key" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_notes",
                schema: "crm",
                table: "notes",
                columns: new[] { "OrganisationId", "Id" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_issuer_settings",
                schema: "invoicing",
                table: "issuer_settings",
                column: "OrganisationId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_entries",
                schema: "invoicing",
                table: "entries",
                columns: new[] { "OrganisationId", "Id" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_documents",
                schema: "invoicing",
                table: "documents",
                columns: new[] { "OrganisationId", "Id" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_configuration",
                schema: "crm",
                table: "configuration",
                column: "OrganisationId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_attachments1",
                schema: "invoicing",
                table: "attachments",
                columns: new[] { "OrganisationId", "RecordId", "FileId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_attachments",
                schema: "crm",
                table: "attachments",
                columns: new[] { "OrganisationId", "RecordId", "FileId" });

            migrationBuilder.CreateTable(
                name: "invitations",
                schema: "organisations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Role = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    SentAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_invitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_invitations_customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "organisations",
                        principalTable: "customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "memberships",
                schema: "organisations",
                columns: table => new
                {
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_memberships", x => new { x.CustomerId, x.UserId });
                    table.ForeignKey(
                        name: "FK_memberships_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "identity",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_memberships_customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "organisations",
                        principalTable: "customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                schema: "billing",
                table: "settings",
                keyColumn: "Id",
                keyValue: 1,
                column: "Ownership",
                value: "Both");

            migrationBuilder.CreateIndex(
                name: "IX_records_OrganisationId_Kind_Archived_Name_Id",
                schema: "crm",
                table: "records",
                columns: new[] { "OrganisationId", "Kind", "Archived", "Name", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_notes_OrganisationId_RecordId_At",
                schema: "crm",
                table: "notes",
                columns: new[] { "OrganisationId", "RecordId", "At" });

            migrationBuilder.CreateIndex(
                name: "IX_entries_OrganisationId_DocumentId",
                schema: "invoicing",
                table: "entries",
                columns: new[] { "OrganisationId", "DocumentId" });

            migrationBuilder.CreateIndex(
                name: "IX_documents_OrganisationId_IssuedAt_Id",
                schema: "invoicing",
                table: "documents",
                columns: new[] { "OrganisationId", "IssuedAt", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_documents_OrganisationId_Number",
                schema: "invoicing",
                table: "documents",
                columns: new[] { "OrganisationId", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_documents_OrganisationId_OriginModule_OriginType_OriginId",
                schema: "invoicing",
                table: "documents",
                columns: new[] { "OrganisationId", "OriginModule", "OriginType", "OriginId" },
                unique: true,
                filter: "\"Kind\" = 'Invoice' AND \"OriginId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_customers_PersonalUserId",
                schema: "organisations",
                table: "customers",
                column: "PersonalUserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_invitations_CustomerId_Email",
                schema: "organisations",
                table: "invitations",
                columns: new[] { "CustomerId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_memberships_UserId",
                schema: "organisations",
                table: "memberships",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_customers_AspNetUsers_PersonalUserId",
                schema: "organisations",
                table: "customers",
                column: "PersonalUserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

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
    }
}
