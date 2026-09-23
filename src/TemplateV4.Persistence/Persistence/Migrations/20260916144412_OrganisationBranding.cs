using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class OrganisationBranding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContactEmail",
                schema: "organisations",
                table: "customers",
                type: "character varying(254)",
                maxLength: 254,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Country",
                schema: "organisations",
                table: "customers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LogoId",
                schema: "organisations",
                table: "customers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TimeZone",
                schema: "organisations",
                table: "customers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "Africa/Johannesburg");

            migrationBuilder.AddColumn<string>(
                name: "WebsiteUrl",
                schema: "organisations",
                table: "customers",
                type: "character varying(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "logos",
                schema: "organisations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Png = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_logos", x => x.Id);
                    table.CheckConstraint("CK_organisation_logo_size", "octet_length(\"Png\") <= 1048576");
                });

            migrationBuilder.UpdateData(
                schema: "organisations",
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                columns: new[] { "ContactEmail", "Country", "LogoId", "TimeZone", "WebsiteUrl" },
                values: new object[] { null, null, null, "Africa/Johannesburg", null });

            migrationBuilder.CreateIndex(
                name: "IX_customers_LogoId",
                schema: "organisations",
                table: "customers",
                column: "LogoId");

            migrationBuilder.AddForeignKey(
                name: "FK_customers_logos_LogoId",
                schema: "organisations",
                table: "customers",
                column: "LogoId",
                principalSchema: "organisations",
                principalTable: "logos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_customers_logos_LogoId",
                schema: "organisations",
                table: "customers");

            migrationBuilder.DropTable(
                name: "logos",
                schema: "organisations");

            migrationBuilder.DropIndex(
                name: "IX_customers_LogoId",
                schema: "organisations",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "ContactEmail",
                schema: "organisations",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "Country",
                schema: "organisations",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "LogoId",
                schema: "organisations",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "TimeZone",
                schema: "organisations",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "WebsiteUrl",
                schema: "organisations",
                table: "customers");
        }
    }
}
