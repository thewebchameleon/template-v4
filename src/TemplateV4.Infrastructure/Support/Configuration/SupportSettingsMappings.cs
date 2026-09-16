using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Support;

public sealed class SupportSettingsRow
{
    public int Id { get; set; } = 1;
    public bool EnquiriesEnabled { get; set; } = true;
    public bool TicketsEnabled { get; set; } = true;
    public string NotificationEmail { get; set; } = "";
    public Guid Version { get; set; }
}
internal static class SupportSettingsMappings
{
    public static void Configure(ModelBuilder model)
    {
        var row = model.Entity<SupportSettingsRow>();
        row.ToTable("settings", "support"); row.HasKey(x => x.Id);
        row.Property(x => x.Version).IsConcurrencyToken();
        row.Property(x => x.NotificationEmail).HasMaxLength(254);
        row.HasData(new SupportSettingsRow { Version = new Guid("e8627a13-b631-4c13-a33f-e31fa8d5b2f1") });
    }
}
