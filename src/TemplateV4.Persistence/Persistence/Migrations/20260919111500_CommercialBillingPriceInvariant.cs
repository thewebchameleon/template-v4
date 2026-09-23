using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CommercialBillingPriceInvariant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_plan_prices_PlanId_SupersededAt",
                schema: "commercial_billing",
                table: "plan_prices");

            migrationBuilder.CreateIndex(
                name: "IX_plan_prices_PlanId",
                schema: "commercial_billing",
                table: "plan_prices",
                column: "PlanId",
                unique: true,
                filter: "\"SupersededAt\" IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_plan_prices_PlanId",
                schema: "commercial_billing",
                table: "plan_prices");

            migrationBuilder.CreateIndex(
                name: "IX_plan_prices_PlanId_SupersededAt",
                schema: "commercial_billing",
                table: "plan_prices",
                columns: new[] { "PlanId", "SupersededAt" });
        }
    }
}
