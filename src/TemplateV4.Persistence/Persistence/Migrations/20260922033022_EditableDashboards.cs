using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EditableDashboards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "dashboards",
                schema: "app",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: true),
                    SourceId = table.Column<Guid>(type: "uuid", nullable: true),
                    Version = table.Column<Guid>(type: "uuid", nullable: false),
                    Layout = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dashboards", x => x.Id);
                    table.CheckConstraint("CK_dashboard_owner", "\"SourceId\" IS NULL OR \"OwnerId\" IS NOT NULL");
                    table.ForeignKey(
                        name: "FK_dashboards_AspNetUsers_OwnerId",
                        column: x => x.OwnerId,
                        principalSchema: "identity",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_dashboards_dashboards_SourceId",
                        column: x => x.SourceId,
                        principalSchema: "app",
                        principalTable: "dashboards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "dashboard_preferences",
                schema: "app",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartingDashboardId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dashboard_preferences", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_dashboard_preferences_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "identity",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_dashboard_preferences_dashboards_StartingDashboardId",
                        column: x => x.StartingDashboardId,
                        principalSchema: "app",
                        principalTable: "dashboards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                schema: "app",
                table: "dashboards",
                columns: new[] { "Id", "Layout", "OwnerId", "SourceId", "Version" },
                values: new object[,]
                {
                    { new Guid("d4500000-0000-0000-0000-000000000001"), "{\"name\":\"dashMyWork\",\"period\":\"all\",\"cards\":[{\"id\":\"d4500002-0000-0000-0001-000000000001\",\"definitionId\":\"core.actions\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0001-000000000002\",\"definitionId\":\"core.reviews\",\"size\":\"large\",\"format\":\"list\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0001-000000000003\",\"definitionId\":\"core.activity\",\"size\":\"large\",\"format\":\"list\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"}]}", null, null, new Guid("d4500001-0000-0000-0000-000000000001") },
                    { new Guid("d4500000-0000-0000-0000-000000000002"), "{\"name\":\"dashBusiness\",\"period\":\"all\",\"cards\":[{\"id\":\"d4500002-0000-0000-0002-000000000001\",\"definitionId\":\"crm.pipeline\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"value\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0002-000000000002\",\"definitionId\":\"invoicing.invoices\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0002-000000000003\",\"definitionId\":\"support.tickets\",\"size\":\"large\",\"format\":\"chart\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"}]}", null, null, new Guid("d4500001-0000-0000-0000-000000000002") },
                    { new Guid("d4500000-0000-0000-0000-000000000003"), "{\"name\":\"dashSales\",\"period\":\"all\",\"cards\":[{\"id\":\"d4500002-0000-0000-0003-000000000001\",\"definitionId\":\"crm.pipeline\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"value\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0003-000000000002\",\"definitionId\":\"crm.stages\",\"size\":\"large\",\"format\":\"chart\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0003-000000000003\",\"definitionId\":\"crm.recent\",\"size\":\"large\",\"format\":\"list\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"}]}", null, null, new Guid("d4500001-0000-0000-0000-000000000003") },
                    { new Guid("d4500000-0000-0000-0000-000000000004"), "{\"name\":\"dashFinance\",\"period\":\"all\",\"cards\":[{\"id\":\"d4500002-0000-0000-0004-000000000001\",\"definitionId\":\"invoicing.invoices\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0004-000000000002\",\"definitionId\":\"invoicing.outstanding\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"value\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0004-000000000003\",\"definitionId\":\"invoicing.quotations\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"}]}", null, null, new Guid("d4500001-0000-0000-0000-000000000004") },
                    { new Guid("d4500000-0000-0000-0000-000000000005"), "{\"name\":\"dashSupport\",\"period\":\"all\",\"cards\":[{\"id\":\"d4500002-0000-0000-0005-000000000001\",\"definitionId\":\"support.tickets\",\"size\":\"large\",\"format\":\"chart\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0005-000000000002\",\"definitionId\":\"support.awaiting\",\"size\":\"large\",\"format\":\"list\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0005-000000000003\",\"definitionId\":\"support.recent\",\"size\":\"large\",\"format\":\"list\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"}]}", null, null, new Guid("d4500001-0000-0000-0000-000000000005") },
                    { new Guid("d4500000-0000-0000-0000-000000000006"), "{\"name\":\"dashAdministration\",\"period\":\"all\",\"cards\":[{\"id\":\"d4500002-0000-0000-0006-000000000001\",\"definitionId\":\"core.registrations\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0006-000000000002\",\"definitionId\":\"core.privacy\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0006-000000000003\",\"definitionId\":\"core.storage\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0006-000000000004\",\"definitionId\":\"cms.drafts\",\"size\":\"large\",\"format\":\"list\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"}]}", null, null, new Guid("d4500001-0000-0000-0000-000000000006") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_dashboard_preferences_StartingDashboardId",
                schema: "app",
                table: "dashboard_preferences",
                column: "StartingDashboardId");

            migrationBuilder.CreateIndex(
                name: "IX_dashboards_OwnerId_SourceId",
                schema: "app",
                table: "dashboards",
                columns: new[] { "OwnerId", "SourceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_dashboards_SourceId",
                schema: "app",
                table: "dashboards",
                column: "SourceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "dashboard_preferences",
                schema: "app");

            migrationBuilder.DropTable(
                name: "dashboards",
                schema: "app");
        }
    }
}
