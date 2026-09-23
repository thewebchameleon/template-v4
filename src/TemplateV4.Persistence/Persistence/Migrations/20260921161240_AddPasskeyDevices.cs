using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPasskeyDevices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "passkey_devices",
                schema: "identity",
                columns: table => new
                {
                    CredentialId = table.Column<byte[]>(type: "bytea", maxLength: 1024, nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeviceId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_passkey_devices", x => x.CredentialId);
                    table.ForeignKey(
                        name: "FK_passkey_devices_AspNetUserPasskeys_CredentialId",
                        column: x => x.CredentialId,
                        principalSchema: "identity",
                        principalTable: "AspNetUserPasskeys",
                        principalColumn: "CredentialId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_passkey_devices_UserId_DeviceId",
                schema: "identity",
                table: "passkey_devices",
                columns: new[] { "UserId", "DeviceId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "passkey_devices",
                schema: "identity");
        }
    }
}
