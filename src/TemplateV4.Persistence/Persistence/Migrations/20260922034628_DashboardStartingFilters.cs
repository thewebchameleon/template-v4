using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class DashboardStartingFilters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "app",
                table: "dashboards",
                keyColumn: "Id",
                keyValue: new Guid("d4500000-0000-0000-0000-000000000001"),
                column: "Layout",
                value: "{\"name\":\"dashMyWork\",\"period\":\"all\",\"cards\":[{\"id\":\"d4500002-0000-0000-0001-000000000001\",\"definitionId\":\"core.actions\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"count\",\"filter\":\"Open\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0001-000000000002\",\"definitionId\":\"core.reviews\",\"size\":\"large\",\"format\":\"list\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0001-000000000003\",\"definitionId\":\"core.activity\",\"size\":\"large\",\"format\":\"list\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"}]}");

            migrationBuilder.UpdateData(
                schema: "app",
                table: "dashboards",
                keyColumn: "Id",
                keyValue: new Guid("d4500000-0000-0000-0000-000000000002"),
                column: "Layout",
                value: "{\"name\":\"dashBusiness\",\"period\":\"all\",\"cards\":[{\"id\":\"d4500002-0000-0000-0002-000000000001\",\"definitionId\":\"crm.pipeline\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"value\",\"filter\":\"Open\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0002-000000000002\",\"definitionId\":\"invoicing.invoices\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"value\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0002-000000000003\",\"definitionId\":\"support.tickets\",\"size\":\"large\",\"format\":\"chart\",\"metric\":\"count\",\"filter\":\"Open\",\"period\":\"inherit\"}]}");

            migrationBuilder.UpdateData(
                schema: "app",
                table: "dashboards",
                keyColumn: "Id",
                keyValue: new Guid("d4500000-0000-0000-0000-000000000003"),
                column: "Layout",
                value: "{\"name\":\"dashSales\",\"period\":\"all\",\"cards\":[{\"id\":\"d4500002-0000-0000-0003-000000000001\",\"definitionId\":\"crm.pipeline\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"value\",\"filter\":\"Open\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0003-000000000002\",\"definitionId\":\"crm.stages\",\"size\":\"large\",\"format\":\"chart\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0003-000000000003\",\"definitionId\":\"crm.recent\",\"size\":\"large\",\"format\":\"list\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"}]}");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "app",
                table: "dashboards",
                keyColumn: "Id",
                keyValue: new Guid("d4500000-0000-0000-0000-000000000001"),
                column: "Layout",
                value: "{\"name\":\"dashMyWork\",\"period\":\"all\",\"cards\":[{\"id\":\"d4500002-0000-0000-0001-000000000001\",\"definitionId\":\"core.actions\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0001-000000000002\",\"definitionId\":\"core.reviews\",\"size\":\"large\",\"format\":\"list\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0001-000000000003\",\"definitionId\":\"core.activity\",\"size\":\"large\",\"format\":\"list\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"}]}");

            migrationBuilder.UpdateData(
                schema: "app",
                table: "dashboards",
                keyColumn: "Id",
                keyValue: new Guid("d4500000-0000-0000-0000-000000000002"),
                column: "Layout",
                value: "{\"name\":\"dashBusiness\",\"period\":\"all\",\"cards\":[{\"id\":\"d4500002-0000-0000-0002-000000000001\",\"definitionId\":\"crm.pipeline\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"value\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0002-000000000002\",\"definitionId\":\"invoicing.invoices\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0002-000000000003\",\"definitionId\":\"support.tickets\",\"size\":\"large\",\"format\":\"chart\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"}]}");

            migrationBuilder.UpdateData(
                schema: "app",
                table: "dashboards",
                keyColumn: "Id",
                keyValue: new Guid("d4500000-0000-0000-0000-000000000003"),
                column: "Layout",
                value: "{\"name\":\"dashSales\",\"period\":\"all\",\"cards\":[{\"id\":\"d4500002-0000-0000-0003-000000000001\",\"definitionId\":\"crm.pipeline\",\"size\":\"large\",\"format\":\"metric\",\"metric\":\"value\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0003-000000000002\",\"definitionId\":\"crm.stages\",\"size\":\"large\",\"format\":\"chart\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"},{\"id\":\"d4500002-0000-0000-0003-000000000003\",\"definitionId\":\"crm.recent\",\"size\":\"large\",\"format\":\"list\",\"metric\":\"count\",\"filter\":\"all\",\"period\":\"inherit\"}]}");
        }
    }
}
