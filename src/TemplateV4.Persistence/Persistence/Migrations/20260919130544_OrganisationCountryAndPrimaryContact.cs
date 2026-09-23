using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class OrganisationCountryAndPrimaryContact : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "organisations",
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                column: "Country",
                value: "ZA");

            migrationBuilder.AlterColumn<string>(
                name: "Country",
                schema: "organisations",
                table: "customers",
                type: "character varying(2)",
                maxLength: 2,
                nullable: false,
                defaultValue: "ZA",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryContactNumber",
                schema: "organisations",
                table: "customers",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrimaryContactNumber",
                schema: "organisations",
                table: "customers");

            migrationBuilder.AlterColumn<string>(
                name: "Country",
                schema: "organisations",
                table: "customers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2)",
                oldMaxLength: 2,
                oldDefaultValue: "ZA");

            migrationBuilder.UpdateData(
                schema: "organisations",
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                column: "Country",
                value: null);
        }
    }
}
