using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AuditEventDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActorNameSnapshot",
                schema: "audit",
                table: "entries",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActorType",
                schema: "audit",
                table: "entries",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChangesJson",
                schema: "audit",
                table: "entries",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FailureCode",
                schema: "audit",
                table: "entries",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MetadataJson",
                schema: "audit",
                table: "entries",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Outcome",
                schema: "audit",
                table: "entries",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reason",
                schema: "audit",
                table: "entries",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RelatedEntitiesJson",
                schema: "audit",
                table: "entries",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SchemaVersion",
                schema: "audit",
                table: "entries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Source",
                schema: "audit",
                table: "entries",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubjectNameSnapshot",
                schema: "audit",
                table: "entries",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubjectType",
                schema: "audit",
                table: "entries",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActorNameSnapshot",
                schema: "audit",
                table: "entries");

            migrationBuilder.DropColumn(
                name: "ActorType",
                schema: "audit",
                table: "entries");

            migrationBuilder.DropColumn(
                name: "ChangesJson",
                schema: "audit",
                table: "entries");

            migrationBuilder.DropColumn(
                name: "FailureCode",
                schema: "audit",
                table: "entries");

            migrationBuilder.DropColumn(
                name: "MetadataJson",
                schema: "audit",
                table: "entries");

            migrationBuilder.DropColumn(
                name: "Outcome",
                schema: "audit",
                table: "entries");

            migrationBuilder.DropColumn(
                name: "Reason",
                schema: "audit",
                table: "entries");

            migrationBuilder.DropColumn(
                name: "RelatedEntitiesJson",
                schema: "audit",
                table: "entries");

            migrationBuilder.DropColumn(
                name: "SchemaVersion",
                schema: "audit",
                table: "entries");

            migrationBuilder.DropColumn(
                name: "Source",
                schema: "audit",
                table: "entries");

            migrationBuilder.DropColumn(
                name: "SubjectNameSnapshot",
                schema: "audit",
                table: "entries");

            migrationBuilder.DropColumn(
                name: "SubjectType",
                schema: "audit",
                table: "entries");
        }
    }
}
