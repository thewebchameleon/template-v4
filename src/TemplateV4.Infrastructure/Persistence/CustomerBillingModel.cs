using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Persistence;

public static class CustomerBillingModel
{
    public static void Configure(ModelBuilder model)
    {
        model.Entity<CustomerRow>(e =>
        {
            e.ToTable("customers", "organisations", t => t.HasCheckConstraint("CK_organisation_singleton", "\"Id\" = '00000000-0000-0000-0000-000000000001'::uuid"));
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(120);
            e.Property(x => x.WebsiteUrl).HasMaxLength(2048);
            e.Property(x => x.ContactEmail).HasMaxLength(254);
            e.Property(x => x.TimeZone).HasMaxLength(100).HasDefaultValue("Africa/Johannesburg");
            e.Property(x => x.Country).HasMaxLength(100);
            e.Property(x => x.Version).IsConcurrencyToken();
            e.HasOne<OrganisationLogoRow>().WithMany().HasForeignKey(x => x.LogoId).OnDelete(DeleteBehavior.Restrict);
            e.HasData(new CustomerRow { Id = TemplateV4.Application.Customers.Organisation.Id, Name = "Organisation", TimeZone = "Africa/Johannesburg", Version = new Guid("d473876e-a68f-4d80-8c97-ccdddcddbcdb") });
        });
        model.Entity<OrganisationLogoRow>(e =>
        {
            e.ToTable("logos", "organisations", t => t.HasCheckConstraint("CK_organisation_logo_size", "octet_length(\"Png\") <= 1048576"));
            e.HasKey(x => x.Id);
        });
        model.Entity<SubscriptionRow>(e => { e.ToTable("subscriptions", "billing", t => t.HasCheckConstraint("CK_subscription_singleton", "\"CustomerId\" = '00000000-0000-0000-0000-000000000001'::uuid")); e.HasKey(x => x.CustomerId); e.Property(x => x.PlanId).HasMaxLength(64); e.HasIndex(x => x.NextCheckAt); });
        model.Entity<PaymentOrderRow>(e => { e.ToTable("orders", "billing"); e.HasKey(x => x.Id); e.Property(x => x.PlanId).HasMaxLength(64); e.Property(x => x.Provider).HasMaxLength(16); e.Property(x => x.Interval).HasMaxLength(8); e.Property(x => x.Currency).HasMaxLength(3); e.HasIndex(x => x.CustomerId); });
        model.Entity<PaymentReceiptRow>(e => { e.ToTable("receipts", "billing"); e.HasKey(x => new { x.Provider, x.Id }); e.Property(x => x.Provider).HasMaxLength(16); e.Property(x => x.Id).HasMaxLength(128); e.HasOne<PaymentOrderRow>().WithMany().HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Restrict); });
        model.Entity<BillingSettingsRow>(e => { e.ToTable("settings", "billing", t => t.HasCheckConstraint("CK_billing_singleton", "\"Id\" = 1")); e.HasKey(x => x.Id); e.Property(x => x.Version).IsConcurrencyToken(); e.HasData(new BillingSettingsRow { Version = new Guid("701d0245-9cc1-4028-a909-380f43739f13") }); });
    }
}
