using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SchemaDrivenCms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string[]>(
                name: "Collections",
                schema: "app",
                table: "api_keys",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);

            migrationBuilder.CreateTable(
                name: "collections",
                schema: "cms",
                columns: table => new
                {
                    Key = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Label = table.Column<string>(type: "text", nullable: false),
                    Version = table.Column<Guid>(type: "uuid", nullable: false),
                    Fields = table.Column<string>(type: "text", nullable: false),
                    Workflow = table.Column<string>(type: "text", nullable: false),
                    PublicRead = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_collections", x => x.Key);
                });

            migrationBuilder.CreateTable(
                name: "grants",
                schema: "cms",
                columns: table => new
                {
                    Collection = table.Column<string>(type: "character varying(64)", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    Permission = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_grants", x => new { x.Collection, x.RoleId, x.Permission });
                    table.ForeignKey(
                        name: "FK_grants_collections_Collection",
                        column: x => x.Collection,
                        principalSchema: "cms",
                        principalTable: "collections",
                        principalColumn: "Key",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "items",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Collection = table.Column<string>(type: "character varying(64)", nullable: false),
                    Version = table.Column<Guid>(type: "uuid", nullable: false),
                    DraftRevisionId = table.Column<Guid>(type: "uuid", nullable: false),
                    PublishedRevisionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Title = table.Column<string>(type: "text", nullable: false),
                    State = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    PublishedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    PublishedUpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_items_collections_Collection",
                        column: x => x.Collection,
                        principalSchema: "cms",
                        principalTable: "collections",
                        principalColumn: "Key",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "schemas",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Collection = table.Column<string>(type: "character varying(64)", nullable: false),
                    Fields = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_schemas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_schemas_collections_Collection",
                        column: x => x.Collection,
                        principalSchema: "cms",
                        principalTable: "collections",
                        principalColumn: "Key",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "revisions",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    SchemaId = table.Column<Guid>(type: "uuid", nullable: false),
                    AuthorId = table.Column<Guid>(type: "uuid", nullable: true),
                    Values = table.Column<string>(type: "jsonb", nullable: false),
                    Workflow = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_revisions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_revisions_items_ItemId",
                        column: x => x.ItemId,
                        principalSchema: "cms",
                        principalTable: "items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_revisions_schemas_SchemaId",
                        column: x => x.SchemaId,
                        principalSchema: "cms",
                        principalTable: "schemas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "relationships",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RevisionId = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetId = table.Column<Guid>(type: "uuid", nullable: false),
                    Path = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_relationships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_relationships_items_TargetId",
                        column: x => x.TargetId,
                        principalSchema: "cms",
                        principalTable: "items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_relationships_revisions_RevisionId",
                        column: x => x.RevisionId,
                        principalSchema: "cms",
                        principalTable: "revisions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "reviews",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RevisionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReviewerId = table.Column<Guid>(type: "uuid", nullable: false),
                    State = table.Column<string>(type: "text", nullable: false),
                    Comment = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_reviews_revisions_RevisionId",
                        column: x => x.RevisionId,
                        principalSchema: "cms",
                        principalTable: "revisions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_items_Collection_UpdatedAt_Id",
                schema: "cms",
                table: "items",
                columns: new[] { "Collection", "UpdatedAt", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_relationships_RevisionId",
                schema: "cms",
                table: "relationships",
                column: "RevisionId");

            migrationBuilder.CreateIndex(
                name: "IX_relationships_TargetId",
                schema: "cms",
                table: "relationships",
                column: "TargetId");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_RevisionId_ReviewerId",
                schema: "cms",
                table: "reviews",
                columns: new[] { "RevisionId", "ReviewerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_revisions_ItemId",
                schema: "cms",
                table: "revisions",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_revisions_SchemaId",
                schema: "cms",
                table: "revisions",
                column: "SchemaId");

            migrationBuilder.CreateIndex(
                name: "IX_schemas_Collection",
                schema: "cms",
                table: "schemas",
                column: "Collection");
            migrationBuilder.Sql("""
                INSERT INTO cms.collections ("Key", "Label", "Version", "Fields", "Workflow", "PublicRead")
                VALUES ('articles', 'Articles', '459596de-3500-4b8a-8b7a-36deed8b62b5', '[{"key":"title","label":"Title","type":"text","required":true},{"key":"slug","label":"Slug","type":"text","required":true},{"key":"excerpt","label":"Excerpt","type":"text","required":true},{"key":"markdown","label":"Body","type":"richText","required":true},{"key":"author","label":"Author","type":"text","required":true}]', '{"required":true,"approvals":1,"autoPublish":false,"users":[],"roles":[]}', true);
                INSERT INTO cms.schemas ("Id", "Collection", "Fields")
                SELECT "Version", "Key", "Fields" FROM cms.collections WHERE "Key" = 'articles';
                INSERT INTO cms.items ("Id", "Collection", "Version", "DraftRevisionId", "PublishedRevisionId", "Title", "State", "UpdatedAt", "PublishedAt", "PublishedUpdatedAt")
                SELECT "Id", 'articles', "Version", gen_random_uuid(), CASE WHEN "Published" THEN gen_random_uuid() ELSE NULL END,
                       "Title", CASE WHEN "Published" AND "Draft" = "PublishedContent" THEN 'Published' ELSE 'Draft' END,
                       "UpdatedAt", "PublishedAt", "PublishedUpdatedAt" FROM cms.articles;
                INSERT INTO cms.revisions ("Id", "ItemId", "SchemaId", "Values", "CreatedAt")
                SELECT i."DraftRevisionId", i."Id", '459596de-3500-4b8a-8b7a-36deed8b62b5', a."Draft"::jsonb, a."UpdatedAt"
                FROM cms.items i JOIN cms.articles a ON a."Id" = i."Id";
                INSERT INTO cms.revisions ("Id", "ItemId", "SchemaId", "Values", "CreatedAt")
                SELECT i."PublishedRevisionId", i."Id", '459596de-3500-4b8a-8b7a-36deed8b62b5', a."PublishedContent"::jsonb, a."PublishedUpdatedAt"
                FROM cms.items i JOIN cms.articles a ON a."Id" = i."Id" WHERE i."PublishedRevisionId" IS NOT NULL;
                INSERT INTO cms.revisions ("Id", "ItemId", "SchemaId", "Values", "CreatedAt")
                SELECT gen_random_uuid(), i."Id", '459596de-3500-4b8a-8b7a-36deed8b62b5', a."PublishedContent"::jsonb, coalesce(a."PublishedUpdatedAt", a."UpdatedAt")
                FROM cms.items i JOIN cms.articles a ON a."Id" = i."Id" WHERE NOT a."Published" AND a."PublishedContent" IS NOT NULL;
                UPDATE cms.items SET "PublishedRevisionId" = "DraftRevisionId" WHERE "State" = 'Published';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "grants",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "relationships",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "reviews",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "revisions",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "items",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "schemas",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "collections",
                schema: "cms");

            migrationBuilder.DropColumn(
                name: "Collections",
                schema: "app",
                table: "api_keys");
        }
    }
}
