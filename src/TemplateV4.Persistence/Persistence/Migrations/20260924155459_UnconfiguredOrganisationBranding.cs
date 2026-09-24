using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UnconfiguredOrganisationBranding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "TimeZone",
                schema: "organisations",
                table: "customers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldDefaultValue: "Africa/Johannesburg");

            migrationBuilder.Sql("""
                UPDATE organisations.customers
                SET "Country" = NULL, "Name" = '', "TimeZone" = ''
                WHERE "Id" = '00000000-0000-0000-0000-000000000001'
                  AND "Version" = 'd473876e-a68f-4d80-8c97-ccdddcddbcdb'
                  AND "Name" = 'Organisation'
                  AND "TimeZone" = 'Africa/Johannesburg'
                  AND "Country" = 'ZA';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "TimeZone",
                schema: "organisations",
                table: "customers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "Africa/Johannesburg",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.Sql("""
                UPDATE organisations.customers
                SET "Country" = 'ZA', "Name" = 'Organisation', "TimeZone" = 'Africa/Johannesburg'
                WHERE "Id" = '00000000-0000-0000-0000-000000000001'
                  AND "Version" = 'd473876e-a68f-4d80-8c97-ccdddcddbcdb'
                  AND "Name" = ''
                  AND "TimeZone" = ''
                  AND "Country" IS NULL;
                """);
        }
    }
}
