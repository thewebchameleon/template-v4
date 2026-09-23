using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CmsArticles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "cms");

            migrationBuilder.CreateTable(
                name: "articles",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Version = table.Column<Guid>(type: "uuid", nullable: false),
                    Slug = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Draft = table.Column<string>(type: "text", nullable: false),
                    PublishedContent = table.Column<string>(type: "text", nullable: true),
                    Published = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    PublishedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    PublishedUpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_articles", x => x.Id);
                });

            migrationBuilder.InsertData(
                schema: "app",
                table: "runtime_modules",
                columns: new[] { "Id", "Enabled", "Version" },
                values: new object[] { "cms", true, new Guid("a274bd77-60b9-4128-af9d-1084b2d8a34e") });

            migrationBuilder.CreateIndex(
                name: "IX_articles_Published_PublishedAt_Id",
                schema: "cms",
                table: "articles",
                columns: new[] { "Published", "PublishedAt", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_articles_Slug",
                schema: "cms",
                table: "articles",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "articles",
                schema: "cms");

            migrationBuilder.DeleteData(
                schema: "app",
                table: "runtime_modules",
                keyColumn: "Id",
                keyValue: "cms");
        }
    }
}
