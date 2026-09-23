using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateV4.Crm.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AlignCommercialBillingActivation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // The core migration owns the activation merge. This migration aligns the inherited model snapshot.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
