using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CustomerAccountsAndBilling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "organizations");

            migrationBuilder.EnsureSchema(
                name: "billing");

            migrationBuilder.CreateTable(
                name: "customers",
                schema: "organizations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PersonalUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Version = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_customers_AspNetUsers_PersonalUserId",
                        column: x => x.PersonalUserId,
                        principalSchema: "identity",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                schema: "billing",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlanId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Provider = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Interval = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    UnitMinor = table.Column<long>(type: "bigint", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ProtectedSubscription = table.Column<string>(type: "text", nullable: true),
                    CheckoutReference = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_orders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "organization_files",
                schema: "files",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    UploadedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Ready = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    PurgedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_organization_files", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "settings",
                schema: "billing",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Ownership = table.Column<string>(type: "text", nullable: false),
                    StripeEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    PayFastEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    DefaultProvider = table.Column<string>(type: "text", nullable: false),
                    TrialDays = table.Column<int>(type: "integer", nullable: false),
                    GraceDays = table.Column<int>(type: "integer", nullable: false),
                    Version = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_settings", x => x.Id);
                    table.CheckConstraint("CK_billing_singleton", "\"Id\" = 1");
                });

            migrationBuilder.CreateTable(
                name: "subscriptions",
                schema: "billing",
                columns: table => new
                {
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlanId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    TrialUntil = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    TrialUsed = table.Column<bool>(type: "boolean", nullable: false),
                    PaidUntil = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    Cancelled = table.Column<bool>(type: "boolean", nullable: false),
                    CancelRequested = table.Column<bool>(type: "boolean", nullable: false),
                    Seats = table.Column<int>(type: "integer", nullable: false),
                    NextCheckAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_subscriptions", x => x.CustomerId);
                });

            migrationBuilder.CreateTable(
                name: "invitations",
                schema: "organizations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Role = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_invitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_invitations_customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "organizations",
                        principalTable: "customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "memberships",
                schema: "organizations",
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
                        principalSchema: "organizations",
                        principalTable: "customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "receipts",
                schema: "billing",
                columns: table => new
                {
                    Provider = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Id = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    At = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_receipts", x => new { x.Provider, x.Id });
                    table.ForeignKey(
                        name: "FK_receipts_orders_OrderId",
                        column: x => x.OrderId,
                        principalSchema: "billing",
                        principalTable: "orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                schema: "billing",
                table: "settings",
                columns: new[] { "Id", "DefaultProvider", "GraceDays", "Ownership", "PayFastEnabled", "StripeEnabled", "TrialDays", "Version" },
                values: new object[] { 1, "payfast", 7, "Both", true, true, 14, new Guid("701d0245-9cc1-4028-a909-380f43739f13") });

            migrationBuilder.CreateIndex(
                name: "IX_customers_PersonalUserId",
                schema: "organizations",
                table: "customers",
                column: "PersonalUserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_invitations_CustomerId_Email",
                schema: "organizations",
                table: "invitations",
                columns: new[] { "CustomerId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_memberships_UserId",
                schema: "organizations",
                table: "memberships",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_orders_CustomerId",
                schema: "billing",
                table: "orders",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_organization_files_CustomerId_CreatedAt",
                schema: "files",
                table: "organization_files",
                columns: new[] { "CustomerId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_organization_files_DeletedAt",
                schema: "files",
                table: "organization_files",
                column: "DeletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_receipts_OrderId",
                schema: "billing",
                table: "receipts",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_subscriptions_NextCheckAt",
                schema: "billing",
                table: "subscriptions",
                column: "NextCheckAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "invitations",
                schema: "organizations");

            migrationBuilder.DropTable(
                name: "memberships",
                schema: "organizations");

            migrationBuilder.DropTable(
                name: "organization_files",
                schema: "files");

            migrationBuilder.DropTable(
                name: "receipts",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "settings",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "subscriptions",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "customers",
                schema: "organizations");

            migrationBuilder.DropTable(
                name: "orders",
                schema: "billing");
        }
    }
}
