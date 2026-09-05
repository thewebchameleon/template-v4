using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace templatev4.Infrastructure.Persistence.Migrations;

[DbContext(typeof(FrameworkDb))]
[Migration("20260905110000_QuartzSchema")]
public sealed class QuartzSchema : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        using var stream = typeof(FrameworkDb).Assembly.GetManifestResourceStream("templatev4.Infrastructure.Persistence.Migrations.quartz-3.20.1.sql")!;
        using var reader = new StreamReader(stream);
        migrationBuilder.Sql(reader.ReadToEnd());
    }
    protected override void Down(MigrationBuilder migrationBuilder) => throw new NotSupportedException("Quartz downgrade requires a reviewed data migration.");
}
