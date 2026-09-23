using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Support.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AllowIncompleteTicketDrafts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "CategoryId",
                schema: "support",
                table: "tickets",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DO $$ BEGIN
                    IF EXISTS (SELECT 1 FROM support.tickets WHERE "CategoryId" IS NULL) THEN
                        RAISE EXCEPTION 'Cannot remove incomplete ticket drafts while tickets without a category exist.';
                    END IF;
                END $$;
                """);
            migrationBuilder.AlterColumn<Guid>(
                name: "CategoryId",
                schema: "support",
                table: "tickets",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
