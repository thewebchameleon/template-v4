using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PaymentsAndCommercialBilling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_receipts_orders_OrderId",
                schema: "billing",
                table: "receipts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_settings2",
                schema: "website",
                table: "settings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_settings1",
                schema: "support",
                table: "settings");

            migrationBuilder.DropCheckConstraint(
                name: "CK_subscription_singleton",
                schema: "billing",
                table: "subscriptions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_settings",
                schema: "billing",
                table: "settings");

            migrationBuilder.DropCheckConstraint(
                name: "CK_billing_singleton",
                schema: "billing",
                table: "settings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_receipts",
                schema: "billing",
                table: "receipts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_orders",
                schema: "billing",
                table: "orders");

            migrationBuilder.EnsureSchema(
                name: "commercial_billing");

            migrationBuilder.EnsureSchema(
                name: "payments");

            migrationBuilder.RenameTable(
                name: "subscriptions",
                schema: "billing",
                newName: "subscriptions",
                newSchema: "commercial_billing");

            migrationBuilder.RenameTable(
                name: "settings",
                schema: "billing",
                newName: "settings",
                newSchema: "payments");

            migrationBuilder.RenameTable(
                name: "receipts",
                schema: "billing",
                newName: "payment_receipts",
                newSchema: "commercial_billing");

            migrationBuilder.RenameTable(
                name: "orders",
                schema: "billing",
                newName: "payment_orders",
                newSchema: "commercial_billing");

            migrationBuilder.RenameIndex(
                name: "IX_receipts_OrderId",
                schema: "commercial_billing",
                table: "payment_receipts",
                newName: "IX_payment_receipts_OrderId");

            migrationBuilder.RenameIndex(
                name: "IX_orders_CustomerId",
                schema: "commercial_billing",
                table: "payment_orders",
                newName: "IX_payment_orders_CustomerId");

            migrationBuilder.AddColumn<Guid>(
                name: "PlanPriceId",
                schema: "commercial_billing",
                table: "subscriptions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DefaultProvider",
                schema: "payments",
                table: "settings",
                type: "character varying(16)",
                maxLength: 16,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<long>(
                name: "AmountMinor",
                schema: "commercial_billing",
                table: "payment_receipts",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                schema: "commercial_billing",
                table: "payment_receipts",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "commercial_billing",
                table: "payment_orders",
                type: "character varying(160)",
                maxLength: 160,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Interval",
                schema: "commercial_billing",
                table: "payment_orders",
                type: "character varying(16)",
                maxLength: 16,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(8)",
                oldMaxLength: 8);

            migrationBuilder.AddColumn<Guid>(
                name: "PlanPriceId",
                schema: "commercial_billing",
                table: "payment_orders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Purpose",
                schema: "commercial_billing",
                table: "payment_orders",
                type: "character varying(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_settings3",
                schema: "website",
                table: "settings",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_settings2",
                schema: "support",
                table: "settings",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_settings1",
                schema: "payments",
                table: "settings",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_payment_receipts",
                schema: "commercial_billing",
                table: "payment_receipts",
                columns: new[] { "Provider", "Id" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_payment_orders",
                schema: "commercial_billing",
                table: "payment_orders",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "invoices",
                schema: "commercial_billing",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    PaymentOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    State = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalMinor = table.Column<long>(type: "bigint", nullable: false),
                    IssuedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    PaidAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    PeriodStart = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    PeriodEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_invoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_invoices_payment_orders_PaymentOrderId",
                        column: x => x.PaymentOrderId,
                        principalSchema: "commercial_billing",
                        principalTable: "payment_orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "plans",
                schema: "commercial_billing",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Pricing = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    StorageBytes = table.Column<long>(type: "bigint", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_plans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "settings",
                schema: "commercial_billing",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TrialDays = table.Column<int>(type: "integer", nullable: false),
                    GraceDays = table.Column<int>(type: "integer", nullable: false),
                    Version = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_settings", x => x.Id);
                    table.CheckConstraint("CK_commercial_billing_singleton", "\"Id\" = 1");
                });

            migrationBuilder.CreateTable(
                name: "usage_counters",
                schema: "commercial_billing",
                columns: table => new
                {
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    PeriodStart = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    PeriodEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Quantity = table.Column<long>(type: "bigint", nullable: false),
                    Version = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usage_counters", x => new { x.CustomerId, x.Code, x.PeriodStart });
                });

            migrationBuilder.CreateTable(
                name: "entitlements",
                schema: "commercial_billing",
                columns: table => new
                {
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Limit = table.Column<long>(type: "bigint", nullable: false),
                    ValidUntil = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_entitlements", x => new { x.CustomerId, x.Code });
                    table.ForeignKey(
                        name: "FK_entitlements_invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "commercial_billing",
                        principalTable: "invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "plan_prices",
                schema: "commercial_billing",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PlanId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    MonthlyMinor = table.Column<long>(type: "bigint", nullable: false),
                    YearlyMinor = table.Column<long>(type: "bigint", nullable: false),
                    EffectiveFrom = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    SupersededAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_plan_prices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_plan_prices_plans_PlanId",
                        column: x => x.PlanId,
                        principalSchema: "commercial_billing",
                        principalTable: "plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                schema: "commercial_billing",
                table: "plans",
                columns: new[] { "Id", "Active", "Name", "Pricing", "StorageBytes" },
                values: new object[,]
                {
                    { "free", true, "Free", "Flat", 104857600L },
                    { "standard", true, "Standard", "Flat", 10737418240L },
                    { "team", true, "Team", "PerSeat", 53687091200L }
                });

            migrationBuilder.InsertData(
                schema: "commercial_billing",
                table: "settings",
                columns: new[] { "Id", "GraceDays", "TrialDays", "Version" },
                values: new object[] { 1, 7, 14, new Guid("701d0245-9cc1-4028-a909-380f43739f13") });

            migrationBuilder.Sql("""
                UPDATE commercial_billing.settings AS target
                SET "GraceDays" = source."GraceDays", "TrialDays" = source."TrialDays"
                FROM payments.settings AS source
                WHERE target."Id" = 1 AND source."Id" = 1;
                """);

            migrationBuilder.DropColumn(
                name: "GraceDays",
                schema: "payments",
                table: "settings");

            migrationBuilder.DropColumn(
                name: "TrialDays",
                schema: "payments",
                table: "settings");

            migrationBuilder.UpdateData(
                schema: "payments",
                table: "settings",
                keyColumn: "Id",
                keyValue: 1,
                column: "Version",
                value: new Guid("0fa2db45-b9b8-4cee-9320-84ebf3c5636b"));

            migrationBuilder.InsertData(
                schema: "commercial_billing",
                table: "plan_prices",
                columns: new[] { "Id", "Currency", "EffectiveFrom", "MonthlyMinor", "PlanId", "SupersededAt", "YearlyMinor" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-4111-8111-111111111111"), "ZAR", new DateTimeOffset(new DateTime(2026, 9, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 0L, "free", null, 0L },
                    { new Guid("22222222-2222-4222-8222-222222222222"), "ZAR", new DateTimeOffset(new DateTime(2026, 9, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 9900L, "standard", null, 99000L },
                    { new Guid("33333333-3333-4333-8333-333333333333"), "ZAR", new DateTimeOffset(new DateTime(2026, 9, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 4900L, "team", null, 49000L }
                });

            migrationBuilder.CreateIndex(
                name: "IX_subscriptions_PlanPriceId",
                schema: "commercial_billing",
                table: "subscriptions",
                column: "PlanPriceId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_commercial_subscription_singleton",
                schema: "commercial_billing",
                table: "subscriptions",
                sql: "\"CustomerId\" = '00000000-0000-0000-0000-000000000001'::uuid");

            migrationBuilder.AddCheckConstraint(
                name: "CK_payment_methods_singleton",
                schema: "payments",
                table: "settings",
                sql: "\"Id\" = 1");

            migrationBuilder.CreateIndex(
                name: "IX_payment_orders_PlanPriceId",
                schema: "commercial_billing",
                table: "payment_orders",
                column: "PlanPriceId");

            migrationBuilder.CreateIndex(
                name: "IX_entitlements_InvoiceId",
                schema: "commercial_billing",
                table: "entitlements",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_invoices_Number",
                schema: "commercial_billing",
                table: "invoices",
                column: "Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_invoices_PaymentOrderId",
                schema: "commercial_billing",
                table: "invoices",
                column: "PaymentOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_plan_prices_PlanId_SupersededAt",
                schema: "commercial_billing",
                table: "plan_prices",
                columns: new[] { "PlanId", "SupersededAt" });

            migrationBuilder.CreateIndex(
                name: "IX_usage_counters_PeriodEnd",
                schema: "commercial_billing",
                table: "usage_counters",
                column: "PeriodEnd");

            migrationBuilder.AddForeignKey(
                name: "FK_payment_orders_plan_prices_PlanPriceId",
                schema: "commercial_billing",
                table: "payment_orders",
                column: "PlanPriceId",
                principalSchema: "commercial_billing",
                principalTable: "plan_prices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_payment_receipts_payment_orders_OrderId",
                schema: "commercial_billing",
                table: "payment_receipts",
                column: "OrderId",
                principalSchema: "commercial_billing",
                principalTable: "payment_orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_subscriptions_plan_prices_PlanPriceId",
                schema: "commercial_billing",
                table: "subscriptions",
                column: "PlanPriceId",
                principalSchema: "commercial_billing",
                principalTable: "plan_prices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_payment_orders_plan_prices_PlanPriceId",
                schema: "commercial_billing",
                table: "payment_orders");

            migrationBuilder.DropForeignKey(
                name: "FK_payment_receipts_payment_orders_OrderId",
                schema: "commercial_billing",
                table: "payment_receipts");

            migrationBuilder.DropForeignKey(
                name: "FK_subscriptions_plan_prices_PlanPriceId",
                schema: "commercial_billing",
                table: "subscriptions");

            migrationBuilder.DropTable(
                name: "entitlements",
                schema: "commercial_billing");

            migrationBuilder.DropTable(
                name: "plan_prices",
                schema: "commercial_billing");

            migrationBuilder.DropTable(
                name: "settings",
                schema: "commercial_billing");

            migrationBuilder.DropTable(
                name: "usage_counters",
                schema: "commercial_billing");

            migrationBuilder.DropTable(
                name: "invoices",
                schema: "commercial_billing");

            migrationBuilder.DropTable(
                name: "plans",
                schema: "commercial_billing");

            migrationBuilder.DropPrimaryKey(
                name: "PK_settings3",
                schema: "website",
                table: "settings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_settings2",
                schema: "support",
                table: "settings");

            migrationBuilder.DropIndex(
                name: "IX_subscriptions_PlanPriceId",
                schema: "commercial_billing",
                table: "subscriptions");

            migrationBuilder.DropCheckConstraint(
                name: "CK_commercial_subscription_singleton",
                schema: "commercial_billing",
                table: "subscriptions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_settings1",
                schema: "payments",
                table: "settings");

            migrationBuilder.DropCheckConstraint(
                name: "CK_payment_methods_singleton",
                schema: "payments",
                table: "settings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_payment_receipts",
                schema: "commercial_billing",
                table: "payment_receipts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_payment_orders",
                schema: "commercial_billing",
                table: "payment_orders");

            migrationBuilder.DropIndex(
                name: "IX_payment_orders_PlanPriceId",
                schema: "commercial_billing",
                table: "payment_orders");

            migrationBuilder.DropColumn(
                name: "PlanPriceId",
                schema: "commercial_billing",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "AmountMinor",
                schema: "commercial_billing",
                table: "payment_receipts");

            migrationBuilder.DropColumn(
                name: "Currency",
                schema: "commercial_billing",
                table: "payment_receipts");

            migrationBuilder.DropColumn(
                name: "PlanPriceId",
                schema: "commercial_billing",
                table: "payment_orders");

            migrationBuilder.DropColumn(
                name: "Purpose",
                schema: "commercial_billing",
                table: "payment_orders");

            migrationBuilder.EnsureSchema(
                name: "billing");

            migrationBuilder.RenameTable(
                name: "subscriptions",
                schema: "commercial_billing",
                newName: "subscriptions",
                newSchema: "billing");

            migrationBuilder.RenameTable(
                name: "settings",
                schema: "payments",
                newName: "settings",
                newSchema: "billing");

            migrationBuilder.RenameTable(
                name: "payment_receipts",
                schema: "commercial_billing",
                newName: "receipts",
                newSchema: "billing");

            migrationBuilder.RenameTable(
                name: "payment_orders",
                schema: "commercial_billing",
                newName: "orders",
                newSchema: "billing");

            migrationBuilder.RenameIndex(
                name: "IX_payment_receipts_OrderId",
                schema: "billing",
                table: "receipts",
                newName: "IX_receipts_OrderId");

            migrationBuilder.RenameIndex(
                name: "IX_payment_orders_CustomerId",
                schema: "billing",
                table: "orders",
                newName: "IX_orders_CustomerId");

            migrationBuilder.AlterColumn<string>(
                name: "DefaultProvider",
                schema: "billing",
                table: "settings",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(16)",
                oldMaxLength: 16);

            migrationBuilder.AddColumn<int>(
                name: "GraceDays",
                schema: "billing",
                table: "settings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TrialDays",
                schema: "billing",
                table: "settings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "billing",
                table: "orders",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(160)",
                oldMaxLength: 160);

            migrationBuilder.AlterColumn<string>(
                name: "Interval",
                schema: "billing",
                table: "orders",
                type: "character varying(8)",
                maxLength: 8,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(16)",
                oldMaxLength: 16);

            migrationBuilder.AddPrimaryKey(
                name: "PK_settings2",
                schema: "website",
                table: "settings",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_settings1",
                schema: "support",
                table: "settings",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_settings",
                schema: "billing",
                table: "settings",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_receipts",
                schema: "billing",
                table: "receipts",
                columns: new[] { "Provider", "Id" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_orders",
                schema: "billing",
                table: "orders",
                column: "Id");

            migrationBuilder.UpdateData(
                schema: "billing",
                table: "settings",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "GraceDays", "TrialDays", "Version" },
                values: new object[] { 7, 14, new Guid("701d0245-9cc1-4028-a909-380f43739f13") });

            migrationBuilder.AddCheckConstraint(
                name: "CK_subscription_singleton",
                schema: "billing",
                table: "subscriptions",
                sql: "\"CustomerId\" = '00000000-0000-0000-0000-000000000001'::uuid");

            migrationBuilder.AddCheckConstraint(
                name: "CK_billing_singleton",
                schema: "billing",
                table: "settings",
                sql: "\"Id\" = 1");

            migrationBuilder.AddForeignKey(
                name: "FK_receipts_orders_OrderId",
                schema: "billing",
                table: "receipts",
                column: "OrderId",
                principalSchema: "billing",
                principalTable: "orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
