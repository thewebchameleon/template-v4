using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class WebPushNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PushEnabled",
                schema: "identity",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PushShowPreview",
                schema: "identity",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "web_push_subscriptions",
                schema: "app",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    EndpointHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Endpoint = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    P256dh = table.Column<string>(type: "character varying(87)", maxLength: 87, nullable: false),
                    Auth = table.Column<string>(type: "character varying(22)", maxLength: 22, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_web_push_subscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_web_push_subscriptions_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "identity",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_web_push_subscriptions_EndpointHash",
                schema: "app",
                table: "web_push_subscriptions",
                column: "EndpointHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_web_push_subscriptions_UserId",
                schema: "app",
                table: "web_push_subscriptions",
                column: "UserId");
            migrationBuilder.Sql("""
                CREATE FUNCTION app.queue_notification_push()
                RETURNS trigger LANGUAGE plpgsql AS $function$
                BEGIN
                    INSERT INTO messaging.outbox ("Id", "Type", "Payload", "Culture", "CreatedAt", "AvailableAt", "Attempts")
                    SELECT gen_random_uuid(), 'push.requested.v1',
                        json_build_object('NotificationId', NEW."Id", 'SubscriptionId', s."Id")::text,
                        p."Culture", now(), now(), 0
                    FROM app.web_push_subscriptions s
                    JOIN identity."AspNetUsers" u ON u."Id" = s."UserId"
                    JOIN app.users p ON p."Id" = u."Id"
                    WHERE s."UserId" = NEW."UserId" AND u."PushEnabled" AND NOT p."Disabled" AND p."DeletedAt" IS NULL;
                    RETURN NULL;
                END;
                $function$;
                CREATE TRIGGER notifications_web_push AFTER INSERT ON app.notifications
                    FOR EACH ROW EXECUTE FUNCTION app.queue_notification_push();
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TRIGGER notifications_web_push ON app.notifications; DROP FUNCTION app.queue_notification_push();");
            migrationBuilder.DropTable(
                name: "web_push_subscriptions",
                schema: "app");

            migrationBuilder.DropColumn(
                name: "PushEnabled",
                schema: "identity",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PushShowPreview",
                schema: "identity",
                table: "AspNetUsers");
        }
    }
}
