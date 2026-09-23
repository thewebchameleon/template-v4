using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace TemplateV4.Infrastructure.Persistence.Migrations;

[DbContext(typeof(FrameworkDb))]
[Migration("20260909090000_Quartz4Schema")]
public sealed class Quartz4Schema : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        using var stream = typeof(FrameworkDb).Assembly.GetManifestResourceStream("TemplateV4.Infrastructure.Persistence.Migrations.quartz-4.0.1-upgrade.sql")!;
        using var reader = new StreamReader(stream);
        migrationBuilder.Sql(reader.ReadToEnd());
    }

    protected override void Down(MigrationBuilder migrationBuilder) => throw new NotSupportedException("Quartz downgrade requires a reviewed data migration.");
}
