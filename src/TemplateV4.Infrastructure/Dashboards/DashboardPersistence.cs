using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Dashboards;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Dashboards;

public sealed class DashboardRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? OwnerId { get; set; }
    public Guid? SourceId { get; set; }
    public Guid Version { get; set; } = Guid.NewGuid();
    public string Layout { get; set; } = "{}";
}
public sealed class DashboardPreferenceRow
{
    public Guid UserId { get; set; }
    public Guid? StartingDashboardId { get; set; }
}
internal static class DashboardModel
{
    internal static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    public static void Configure(ModelBuilder model)
    {
        model.Entity<DashboardRow>(e =>
        {
            e.ToTable("dashboards", "app", t => t.HasCheckConstraint("CK_dashboard_owner", "\"SourceId\" IS NULL OR \"OwnerId\" IS NOT NULL"));
            e.HasKey(x => x.Id);
            e.Property(x => x.Version).IsConcurrencyToken();
            e.Property(x => x.Layout).HasColumnType("jsonb");
            e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne<DashboardRow>().WithMany().HasForeignKey(x => x.SourceId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.OwnerId, x.SourceId }).IsUnique();
            e.HasData(Seeds());
        });
        model.Entity<DashboardPreferenceRow>(e =>
        {
            e.ToTable("dashboard_preferences", "app"); e.HasKey(x => x.UserId);
            e.HasOne<AppUser>().WithOne().HasForeignKey<DashboardPreferenceRow>(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne<DashboardRow>().WithMany().HasForeignKey(x => x.StartingDashboardId).OnDelete(DeleteBehavior.SetNull);
        });
    }
    private static DashboardRow[] Seeds()
    {
        string[][] cards = [
            ["core.actions", "core.reviews", "core.activity"],
            ["crm.pipeline", "invoicing.invoices", "support.tickets"],
            ["crm.pipeline", "crm.stages", "crm.recent"],
            ["invoicing.invoices", "invoicing.outstanding", "invoicing.quotations"],
            ["support.tickets", "support.awaiting", "support.recent"],
            ["core.registrations", "core.privacy", "core.storage", "cms.drafts"]];
        string[] names = ["dashMyWork", "dashBusiness", "dashSales", "dashFinance", "dashSupport", "dashAdministration"];
        return names.Select((name, index) => new DashboardRow
        {
            Id = new Guid($"d4500000-0000-0000-0000-{index + 1:000000000000}"),
            Version = new Guid($"d4500001-0000-0000-0000-{index + 1:000000000000}"),
            Layout = JsonSerializer.Serialize(new DashboardLayout(name, "all", cards[index].Select((id, n) => new DashboardCard(
                new Guid($"d4500002-0000-0000-{index + 1:0000}-{n + 1:000000000000}"), id, "large",
                id is "core.activity" or "core.reviews" or "crm.recent" or "support.recent" or "support.awaiting" or "cms.drafts" ? "list" : id is "crm.stages" or "support.tickets" ? "chart" : "metric",
                id is "crm.pipeline" or "invoicing.outstanding" || index == 1 && id == "invoicing.invoices" ? "value" : "count",
                id is "core.actions" or "crm.pipeline" || index == 1 && id == "support.tickets" ? "Open" : "all", "inherit")).ToArray()), Json)
        }).ToArray();
    }
}
