using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class NotificationRealtime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                CREATE FUNCTION app.notify_notification_change()
                RETURNS trigger
                LANGUAGE plpgsql
                AS $function$
                DECLARE
                    target_user uuid;
                BEGIN
                    IF TG_OP = 'DELETE' THEN
                        target_user := OLD."UserId";
                    ELSE
                        target_user := NEW."UserId";
                    END IF;

                    PERFORM pg_notify('notification_changes', target_user::text);
                    RETURN NULL;
                END;
                $function$;

                CREATE TRIGGER notifications_realtime_insert
                AFTER INSERT ON app.notifications
                FOR EACH ROW EXECUTE FUNCTION app.notify_notification_change();

                CREATE TRIGGER notifications_realtime_read
                AFTER UPDATE OF "ReadAt" ON app.notifications
                FOR EACH ROW EXECUTE FUNCTION app.notify_notification_change();

                CREATE TRIGGER notifications_realtime_delete
                AFTER DELETE ON app.notifications
                FOR EACH ROW EXECUTE FUNCTION app.notify_notification_change();
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DROP TRIGGER notifications_realtime_insert ON app.notifications;
                DROP TRIGGER notifications_realtime_read ON app.notifications;
                DROP TRIGGER notifications_realtime_delete ON app.notifications;
                DROP FUNCTION app.notify_notification_change();
                """);
        }
    }
}
