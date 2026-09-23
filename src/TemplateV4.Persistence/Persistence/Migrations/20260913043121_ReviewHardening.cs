using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class ReviewHardening : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "MfaVerifiedAt",
            schema: "identity",
            table: "sessions",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "PasskeyVerified",
            schema: "identity",
            table: "sessions",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "PurgeRetryAt",
            schema: "files",
            table: "organization_files",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "SentAt",
            schema: "organizations",
            table: "invitations",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "ActorId",
            schema: "messaging",
            table: "idempotency",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "Erased",
            schema: "messaging",
            table: "idempotency",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<Guid>(
            name: "SubjectId",
            schema: "messaging",
            table: "idempotency",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "PurgeRetryAt",
            schema: "files",
            table: "files",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "ClosedAt",
            schema: "organizations",
            table: "customers",
            type: "timestamp with time zone",
            nullable: true);

        // Existing MFA sessions were verified at creation. Strong-factor proof is not inferred.
        migrationBuilder.Sql("""
            UPDATE identity.sessions SET "MfaVerifiedAt" = "CreatedAt" WHERE "MfaVerified";
            UPDATE messaging.idempotency SET "ActorId" = split_part("Key", ':', 1)::uuid
            WHERE split_part("Key", ':', 1) ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
            UPDATE messaging.idempotency SET "SubjectId" = ("Response"::jsonb #>> '{Value,Id}')::uuid
            WHERE "Response"::jsonb #>> '{Value,Email}' IS NOT NULL
            AND "Response"::jsonb #>> '{Value,Id}' ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
            UPDATE messaging.idempotency i SET "Response" = '', "Erased" = true
            WHERE EXISTS (SELECT 1 FROM identity."AspNetUsers" u WHERE u."Id" IN (i."ActorId", i."SubjectId") AND u."Email" LIKE 'deleted-%@example.invalid');
            """);

        migrationBuilder.CreateIndex(
            name: "IX_idempotency_ActorId",
            schema: "messaging",
            table: "idempotency",
            column: "ActorId");

        migrationBuilder.CreateIndex(
            name: "IX_idempotency_SubjectId",
            schema: "messaging",
            table: "idempotency",
            column: "SubjectId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_idempotency_ActorId",
            schema: "messaging",
            table: "idempotency");

        migrationBuilder.DropIndex(
            name: "IX_idempotency_SubjectId",
            schema: "messaging",
            table: "idempotency");

        migrationBuilder.DropColumn(
            name: "MfaVerifiedAt",
            schema: "identity",
            table: "sessions");

        migrationBuilder.DropColumn(
            name: "PasskeyVerified",
            schema: "identity",
            table: "sessions");

        migrationBuilder.DropColumn(
            name: "PurgeRetryAt",
            schema: "files",
            table: "organization_files");

        migrationBuilder.DropColumn(
            name: "SentAt",
            schema: "organizations",
            table: "invitations");

        migrationBuilder.DropColumn(
            name: "ActorId",
            schema: "messaging",
            table: "idempotency");

        migrationBuilder.DropColumn(
            name: "Erased",
            schema: "messaging",
            table: "idempotency");

        migrationBuilder.DropColumn(
            name: "SubjectId",
            schema: "messaging",
            table: "idempotency");

        migrationBuilder.DropColumn(
            name: "PurgeRetryAt",
            schema: "files",
            table: "files");

        migrationBuilder.DropColumn(
            name: "ClosedAt",
            schema: "organizations",
            table: "customers");
    }
}
