using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MergeCommercialBillingActivation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DO $migration$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM app.runtime_modules WHERE "Id" = 'invoicing') THEN
                        RAISE EXCEPTION 'Cannot merge module activation: invoicing runtime row is missing.';
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM app.runtime_modules WHERE "Id" = 'commercial-billing') THEN
                        RAISE EXCEPTION 'Cannot merge module activation: commercial-billing runtime row is missing.';
                    END IF;

                    UPDATE app.runtime_modules AS billing
                    SET "Enabled" = billing."Enabled" AND invoicing."Enabled",
                        "Version" = 'c544ced8-0fc1-49b7-8a03-6dde62d47e6e'
                    FROM app.runtime_modules AS invoicing
                    WHERE billing."Id" = 'commercial-billing'
                      AND invoicing."Id" = 'invoicing';
                END
                $migration$;
                """);

            migrationBuilder.DeleteData(
                schema: "app",
                table: "runtime_modules",
                keyColumn: "Id",
                keyValue: "invoicing");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DO $$ BEGIN RAISE EXCEPTION 'Module activation merge requires a forward migration; restore a backup to reverse it.'; END $$;");
        }
    }
}
