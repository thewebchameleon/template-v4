using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CommercialBillingSettlementEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "processed_payment_events",
                schema: "commercial_billing",
                columns: table => new
                {
                    Provider = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Id = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    PaymentOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcessedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_processed_payment_events", x => new { x.Provider, x.Id });
                    table.ForeignKey(
                        name: "FK_processed_payment_events_payment_orders_PaymentOrderId",
                        column: x => x.PaymentOrderId,
                        principalSchema: "commercial_billing",
                        principalTable: "payment_orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_processed_payment_events_PaymentOrderId",
                schema: "commercial_billing",
                table: "processed_payment_events",
                column: "PaymentOrderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "processed_payment_events",
                schema: "commercial_billing");
        }
    }
}
