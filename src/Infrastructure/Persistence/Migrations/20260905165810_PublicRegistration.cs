using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace templatev4.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class PublicRegistration : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "RegistrationEnabled",
            schema: "identity",
            table: "security_settings",
            type: "boolean",
            nullable: false,
            defaultValue: false);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "RegistrationEnabled",
            schema: "identity",
            table: "security_settings");
    }
}
