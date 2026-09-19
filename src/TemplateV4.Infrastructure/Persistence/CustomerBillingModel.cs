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
        model.Entity<PaymentMethodSettingsRow>(e =>
        {
            e.ToTable("settings", "payments", t => t.HasCheckConstraint("CK_payment_methods_singleton", "\"Id\" = 1"));
            e.HasKey(x => x.Id); e.Property(x => x.DefaultProvider).HasMaxLength(16); e.Property(x => x.Version).IsConcurrencyToken();
            e.HasData(new PaymentMethodSettingsRow { Version = new Guid("0fa2db45-b9b8-4cee-9320-84ebf3c5636b") });
        });
        model.Entity<CommercialPlanRow>(e =>
        {
            e.ToTable("plans", "commercial_billing"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.Name).HasMaxLength(160); e.Property(x => x.Pricing).HasMaxLength(16);
            e.HasData(
                new CommercialPlanRow { Id = "free", Name = "Free", Pricing = "Flat", StorageBytes = 100L * 1024 * 1024 },
                new CommercialPlanRow { Id = "standard", Name = "Standard", Pricing = "Flat", StorageBytes = 10L * 1024 * 1024 * 1024 },
                new CommercialPlanRow { Id = "team", Name = "Team", Pricing = "PerSeat", StorageBytes = 50L * 1024 * 1024 * 1024 });
        });
        model.Entity<CommercialPlanPriceRow>(e =>
        {
            e.ToTable("plan_prices", "commercial_billing"); e.HasKey(x => x.Id); e.Property(x => x.PlanId).HasMaxLength(64); e.Property(x => x.Currency).HasMaxLength(3);
            e.HasOne<CommercialPlanRow>().WithMany().HasForeignKey(x => x.PlanId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => x.PlanId).IsUnique().HasFilter("\"SupersededAt\" IS NULL");
            var effective = new DateTimeOffset(2026, 9, 19, 0, 0, 0, TimeSpan.Zero);
            e.HasData(
                new CommercialPlanPriceRow { Id = new Guid("11111111-1111-4111-8111-111111111111"), PlanId = "free", Currency = "ZAR", EffectiveFrom = effective },
                new CommercialPlanPriceRow { Id = new Guid("22222222-2222-4222-8222-222222222222"), PlanId = "standard", Currency = "ZAR", MonthlyMinor = 9900, YearlyMinor = 99000, EffectiveFrom = effective },
                new CommercialPlanPriceRow { Id = new Guid("33333333-3333-4333-8333-333333333333"), PlanId = "team", Currency = "ZAR", MonthlyMinor = 4900, YearlyMinor = 49000, EffectiveFrom = effective });
        });
        model.Entity<SubscriptionRow>(e =>
        {
            e.ToTable("subscriptions", "commercial_billing", t => t.HasCheckConstraint("CK_commercial_subscription_singleton", "\"CustomerId\" = '00000000-0000-0000-0000-000000000001'::uuid"));
            e.HasKey(x => x.CustomerId); e.Property(x => x.PlanId).HasMaxLength(64); e.Property(x => x.PaymentOrderId).HasColumnName("OrderId");
            e.HasOne<CommercialPlanPriceRow>().WithMany().HasForeignKey(x => x.PlanPriceId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => x.NextCheckAt);
        });
        model.Entity<PaymentOrderRow>(e =>
        {
            e.ToTable("payment_orders", "commercial_billing"); e.HasKey(x => x.Id); e.Property(x => x.Purpose).HasMaxLength(80);
            e.Property(x => x.PlanId).HasMaxLength(64); e.Property(x => x.Description).HasColumnName("Name").HasMaxLength(160);
            e.Property(x => x.Provider).HasMaxLength(16); e.Property(x => x.Interval).HasMaxLength(16); e.Property(x => x.Currency).HasMaxLength(3);
            e.Property(x => x.ProtectedProviderReference).HasColumnName("ProtectedSubscription");
            e.HasOne<CommercialPlanPriceRow>().WithMany().HasForeignKey(x => x.PlanPriceId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => x.CustomerId);
        });
        model.Entity<PaymentReceiptRow>(e =>
        {
            e.ToTable("payment_receipts", "commercial_billing"); e.HasKey(x => new { x.Provider, x.Id });
            e.Property(x => x.Provider).HasMaxLength(16); e.Property(x => x.Id).HasMaxLength(128); e.Property(x => x.Currency).HasMaxLength(3);
            e.Property(x => x.PaymentOrderId).HasColumnName("OrderId"); e.Property(x => x.SettledAt).HasColumnName("At");
            e.HasOne<PaymentOrderRow>().WithMany().HasForeignKey(x => x.PaymentOrderId).OnDelete(DeleteBehavior.Restrict);
        });
        model.Entity<ProcessedPaymentEventRow>(e =>
        {
            e.ToTable("processed_payment_events", "commercial_billing"); e.HasKey(x => new { x.Provider, x.Id });
            e.Property(x => x.Provider).HasMaxLength(16); e.Property(x => x.Id).HasMaxLength(128);
            e.HasOne<PaymentOrderRow>().WithMany().HasForeignKey(x => x.PaymentOrderId).OnDelete(DeleteBehavior.Restrict);
        });
        model.Entity<CommercialBillingInvoiceRow>(e =>
        {
            e.ToTable("invoices", "commercial_billing"); e.HasKey(x => x.Id); e.Property(x => x.Number).HasMaxLength(40);
            e.Property(x => x.State).HasMaxLength(20); e.Property(x => x.Currency).HasMaxLength(3); e.HasIndex(x => x.Number).IsUnique();
            e.HasOne<PaymentOrderRow>().WithMany().HasForeignKey(x => x.PaymentOrderId).OnDelete(DeleteBehavior.Restrict);
        });
        model.Entity<CommercialEntitlementRow>(e =>
        {
            e.ToTable("entitlements", "commercial_billing"); e.HasKey(x => new { x.CustomerId, x.Code }); e.Property(x => x.Code).HasMaxLength(80);
            e.HasOne<CommercialBillingInvoiceRow>().WithMany().HasForeignKey(x => x.InvoiceId).OnDelete(DeleteBehavior.Restrict);
        });
        model.Entity<CommercialUsageCounterRow>(e =>
        {
            e.ToTable("usage_counters", "commercial_billing"); e.HasKey(x => new { x.CustomerId, x.Code, x.PeriodStart });
            e.Property(x => x.Code).HasMaxLength(80); e.Property(x => x.Version).IsConcurrencyToken(); e.HasIndex(x => x.PeriodEnd);
        });
        model.Entity<BillingSettingsRow>(e =>
        {
            e.ToTable("settings", "commercial_billing", t => t.HasCheckConstraint("CK_commercial_billing_singleton", "\"Id\" = 1"));
            e.HasKey(x => x.Id); e.Property(x => x.Version).IsConcurrencyToken();
            e.HasData(new BillingSettingsRow { Version = new Guid("701d0245-9cc1-4028-a909-380f43739f13") });
        });
    }
}
