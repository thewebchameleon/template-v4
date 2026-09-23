using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class NamedActionQueues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_action_items_assignment",
                schema: "app",
                table: "action_items");

            migrationBuilder.DropColumn(
                name: "AdministratorOnly",
                schema: "app",
                table: "action_items");

            migrationBuilder.RenameColumn(
                name: "Permission",
                schema: "app",
                table: "action_items",
                newName: "QueueId");

            migrationBuilder.RenameIndex(
                name: "IX_action_items_Permission_State_CreatedAt",
                schema: "app",
                table: "action_items",
                newName: "IX_action_items_QueueId_State_CreatedAt");

            // Preserve obligations; source-less manual work returns to its creator.
            migrationBuilder.Sql("""
                UPDATE app.action_items SET "QueueId" = CASE "Source"
                    WHEN 'Registration' THEN 'registration-approvals'
                    WHEN 'Privacy' THEN 'privacy-reviews' END
                WHERE "Source" IN ('Registration', 'Privacy') AND "QueueId" IS NOT NULL;
                UPDATE app.action_items SET "AssigneeId" = "CreatorId", "QueueId" = NULL
                WHERE "Source" = 'Manual' AND "QueueId" IS NOT NULL;
                """);

            migrationBuilder.AddCheckConstraint(
                name: "CK_action_items_assignment",
                schema: "app",
                table: "action_items",
                sql: "(\"AssigneeId\" IS NULL) <> (\"QueueId\" IS NULL)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_action_items_assignment",
                schema: "app",
                table: "action_items");

            migrationBuilder.RenameColumn(
                name: "QueueId",
                schema: "app",
                table: "action_items",
                newName: "Permission");

            migrationBuilder.RenameIndex(
                name: "IX_action_items_QueueId_State_CreatedAt",
                schema: "app",
                table: "action_items",
                newName: "IX_action_items_Permission_State_CreatedAt");

            migrationBuilder.AddColumn<bool>(
                name: "AdministratorOnly",
                schema: "app",
                table: "action_items",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql("""
                UPDATE app.action_items SET "Permission" = 'settings.manage', "AdministratorOnly" = true
                WHERE "Permission" IN ('registration-approvals', 'privacy-reviews');
                """);

            migrationBuilder.AddCheckConstraint(
                name: "CK_action_items_assignment",
                schema: "app",
                table: "action_items",
                sql: "(\"AssigneeId\" IS NULL) <> (\"Permission\" IS NULL)");
        }
    }
}
