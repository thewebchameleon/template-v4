using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Persistence;

public static class CustomerBillingModel
{
    public static void Configure(ModelBuilder model)
    {
        model.Entity<CustomerRow>(e => { e.ToTable("customers", "organisations"); e.HasKey(x => x.Id); e.Property(x => x.Name).HasMaxLength(120); e.Property(x => x.Version).IsConcurrencyToken(); e.HasIndex(x => x.PersonalUserId).IsUnique(); e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.PersonalUserId).OnDelete(DeleteBehavior.Restrict); });
        model.Entity<MembershipRow>(e => { e.ToTable("memberships", "organisations"); e.HasKey(x => new { x.CustomerId, x.UserId }); e.Property(x => x.Role).HasMaxLength(16); e.HasOne<CustomerRow>().WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Cascade); e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict); });
        model.Entity<CustomerInviteRow>(e => { e.ToTable("invitations", "organisations"); e.HasKey(x => x.Id); e.Property(x => x.Email).HasMaxLength(256); e.Property(x => x.Role).HasMaxLength(16); e.HasIndex(x => new { x.CustomerId, x.Email }).IsUnique(); e.HasOne<CustomerRow>().WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Cascade); });
        model.Entity<SubscriptionRow>(e => { e.ToTable("subscriptions", "billing"); e.HasKey(x => x.CustomerId); e.Property(x => x.PlanId).HasMaxLength(64); e.HasIndex(x => x.NextCheckAt); });
        model.Entity<PaymentOrderRow>(e => { e.ToTable("orders", "billing"); e.HasKey(x => x.Id); e.Property(x => x.PlanId).HasMaxLength(64); e.Property(x => x.Provider).HasMaxLength(16); e.Property(x => x.Interval).HasMaxLength(8); e.Property(x => x.Currency).HasMaxLength(3); e.HasIndex(x => x.CustomerId); });
        model.Entity<PaymentReceiptRow>(e => { e.ToTable("receipts", "billing"); e.HasKey(x => new { x.Provider, x.Id }); e.Property(x => x.Provider).HasMaxLength(16); e.Property(x => x.Id).HasMaxLength(128); e.HasOne<PaymentOrderRow>().WithMany().HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Restrict); });
        model.Entity<BillingSettingsRow>(e => { e.ToTable("settings", "billing", t => t.HasCheckConstraint("CK_billing_singleton", "\"Id\" = 1")); e.HasKey(x => x.Id); e.Property(x => x.Version).IsConcurrencyToken(); e.HasData(new BillingSettingsRow { Version = new Guid("701d0245-9cc1-4028-a909-380f43739f13") }); });
    }
}
