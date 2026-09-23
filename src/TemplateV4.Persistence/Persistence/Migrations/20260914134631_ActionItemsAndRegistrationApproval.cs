using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ActionItemsAndRegistrationApproval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "RegistrationApprovalRequired",
                schema: "identity",
                table: "security_settings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "RegistrationReviewedAt",
                schema: "identity",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RegistrationReviewedBy",
                schema: "identity",
                table: "AspNetUsers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RegistrationState",
                schema: "identity",
                table: "AspNetUsers",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "NotRequired");

            migrationBuilder.CreateTable(
                name: "action_items",
                schema: "app",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Source = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    SourceId = table.Column<Guid>(type: "uuid", nullable: true),
                    SubjectId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatorId = table.Column<Guid>(type: "uuid", nullable: true),
                    AssigneeId = table.Column<Guid>(type: "uuid", nullable: true),
                    Permission = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    AdministratorOnly = table.Column<bool>(type: "boolean", nullable: false),
                    Link = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    State = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CompletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_action_items", x => x.Id);
                    table.CheckConstraint("CK_action_items_assignment", "(\"AssigneeId\" IS NULL) <> (\"Permission\" IS NULL)");
                });

            migrationBuilder.CreateIndex(
                name: "IX_action_items_AssigneeId_State_CreatedAt",
                schema: "app",
                table: "action_items",
                columns: new[] { "AssigneeId", "State", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_action_items_CreatorId_State_CreatedAt",
                schema: "app",
                table: "action_items",
                columns: new[] { "CreatorId", "State", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_action_items_Permission_State_CreatedAt",
                schema: "app",
                table: "action_items",
                columns: new[] { "Permission", "State", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_action_items_Source_SourceId",
                schema: "app",
                table: "action_items",
                columns: new[] { "Source", "SourceId" },
                unique: true);

            // Existing pending obligations become visible immediately after the upgrade.
            migrationBuilder.Sql("""
                INSERT INTO app.action_items ("Id", "Title", "Description", "Source", "SourceId", "SubjectId", "Permission", "AdministratorOnly", "Link", "State", "CreatedAt")
                SELECT gen_random_uuid(), 'privacyReviewAction', '', 'Privacy', "Id", "UserId", 'settings.manage', true,
                    '/administration/users/privacy-requests', 'Open', "RequestedAt"
                FROM app.deletion_requests WHERE "State" = 'Pending';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "action_items",
                schema: "app");

            migrationBuilder.DropColumn(
                name: "RegistrationApprovalRequired",
                schema: "identity",
                table: "security_settings");

            migrationBuilder.DropColumn(
                name: "RegistrationReviewedAt",
                schema: "identity",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "RegistrationReviewedBy",
                schema: "identity",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "RegistrationState",
                schema: "identity",
                table: "AspNetUsers");
        }
    }
}
