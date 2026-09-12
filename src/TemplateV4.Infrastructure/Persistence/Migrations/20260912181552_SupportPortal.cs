using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SupportPortal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "support");

            migrationBuilder.CreateTable(
                name: "categories",
                schema: "support",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Version = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tickets",
                schema: "support",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequesterId = table.Column<Guid>(type: "uuid", nullable: false),
                    Subject = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    Description = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    AssigneeId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Version = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tickets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tickets_AspNetUsers_AssigneeId",
                        column: x => x.AssigneeId,
                        principalSchema: "identity",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tickets_AspNetUsers_RequesterId",
                        column: x => x.RequesterId,
                        principalSchema: "identity",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tickets_categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "support",
                        principalTable: "categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "attachments",
                schema: "support",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TicketId = table.Column<Guid>(type: "uuid", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    Content = table.Column<byte[]>(type: "bytea", nullable: false),
                    At = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_attachments", x => x.Id);
                    table.CheckConstraint("CK_support_attachment_size", "octet_length(\"Content\") BETWEEN 1 AND 5242880");
                    table.ForeignKey(
                        name: "FK_attachments_AspNetUsers_OwnerId",
                        column: x => x.OwnerId,
                        principalSchema: "identity",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_attachments_tickets_TicketId",
                        column: x => x.TicketId,
                        principalSchema: "support",
                        principalTable: "tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "messages",
                schema: "support",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TicketId = table.Column<Guid>(type: "uuid", nullable: false),
                    AuthorId = table.Column<Guid>(type: "uuid", nullable: true),
                    Body = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: false),
                    Internal = table.Column<bool>(type: "boolean", nullable: false),
                    Kind = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    At = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_messages_AspNetUsers_AuthorId",
                        column: x => x.AuthorId,
                        principalSchema: "identity",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_messages_tickets_TicketId",
                        column: x => x.TicketId,
                        principalSchema: "support",
                        principalTable: "tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                schema: "support",
                table: "categories",
                columns: new[] { "Id", "Active", "Name", "Version" },
                values: new object[] { new Guid("9a0e9b19-33fb-49e0-8bd0-77eb7eca5c20"), true, "General", new Guid("44639415-d2d9-4517-be2d-c119d95a5f83") });

            migrationBuilder.InsertData(
                schema: "app",
                table: "runtime_modules",
                columns: new[] { "Id", "Enabled", "Version" },
                values: new object[] { "support", true, new Guid("b6c2b6df-1f86-46ea-90f1-c7bc3b61ba49") });

            migrationBuilder.CreateIndex(
                name: "IX_attachments_OwnerId",
                schema: "support",
                table: "attachments",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_attachments_TicketId",
                schema: "support",
                table: "attachments",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_categories_Name",
                schema: "support",
                table: "categories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_messages_AuthorId",
                schema: "support",
                table: "messages",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_messages_TicketId_At_Id",
                schema: "support",
                table: "messages",
                columns: new[] { "TicketId", "At", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_tickets_AssigneeId",
                schema: "support",
                table: "tickets",
                column: "AssigneeId");

            migrationBuilder.CreateIndex(
                name: "IX_tickets_CategoryId",
                schema: "support",
                table: "tickets",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_tickets_RequesterId_UpdatedAt_Id",
                schema: "support",
                table: "tickets",
                columns: new[] { "RequesterId", "UpdatedAt", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_tickets_Status_UpdatedAt_Id",
                schema: "support",
                table: "tickets",
                columns: new[] { "Status", "UpdatedAt", "Id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "attachments",
                schema: "support");

            migrationBuilder.DropTable(
                name: "messages",
                schema: "support");

            migrationBuilder.DropTable(
                name: "tickets",
                schema: "support");

            migrationBuilder.DropTable(
                name: "categories",
                schema: "support");

            migrationBuilder.DeleteData(
                schema: "app",
                table: "runtime_modules",
                keyColumn: "Id",
                keyValue: "support");
        }
    }
}
