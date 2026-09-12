using Microsoft.EntityFrameworkCore;

namespace TemplateV4.Infrastructure.Persistence;

public sealed class CustomerRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? PersonalUserId { get; set; }
    public string Name { get; set; } = "";
    public Guid Version { get; set; } = Guid.NewGuid();
}
public sealed class MembershipRow
{
    public Guid CustomerId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = "Member";
}
public sealed class CustomerInviteRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public string Email { get; set; } = "";
    public string Role { get; set; } = "Member";
    public DateTimeOffset ExpiresAt { get; set; }
}
public sealed class SubscriptionRow
{
    public Guid CustomerId { get; set; }
    public string PlanId { get; set; } = "free";
    public DateTimeOffset? TrialUntil { get; set; }
    public bool TrialUsed { get; set; }
    public DateTimeOffset? PaidUntil { get; set; }
    public Guid? OrderId { get; set; }
    public bool Cancelled { get; set; }
    public bool CancelRequested { get; set; }
    public int Seats { get; set; } = 1;
    public DateTimeOffset NextCheckAt { get; set; }
}
public sealed class PaymentOrderRow
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string PlanId { get; set; } = "";
    public string Name { get; set; } = "";
    public string Provider { get; set; } = "";
    public string Interval { get; set; } = "month";
    public string Currency { get; set; } = "ZAR";
    public long UnitMinor { get; set; }
    public int Quantity { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? ProtectedSubscription { get; set; }
    public string? CheckoutReference { get; set; }
    public bool Abandoned { get; set; }
}
public sealed class PaymentReceiptRow
{
    public string Provider { get; set; } = "";
    public string Id { get; set; } = "";
    public Guid OrderId { get; set; }
    public DateTimeOffset At { get; set; }
}
public sealed class BillingSettingsRow
{
    public int Id { get; set; } = 1;
    public string Ownership { get; set; } = "Both";
    public bool StripeEnabled { get; set; } = true;
    public bool PayFastEnabled { get; set; } = true;
    public string DefaultProvider { get; set; } = "payfast";
    public int TrialDays { get; set; } = 14;
    public int GraceDays { get; set; } = 7;
    public Guid Version { get; set; }
}
public static class CustomerBillingModel
{
    public static void Configure(ModelBuilder model)
    {
        model.Entity<CustomerRow>(e => { e.ToTable("customers", "organizations"); e.HasKey(x => x.Id); e.Property(x => x.Name).HasMaxLength(120); e.Property(x => x.Version).IsConcurrencyToken(); e.HasIndex(x => x.PersonalUserId).IsUnique(); e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.PersonalUserId).OnDelete(DeleteBehavior.Restrict); });
        model.Entity<MembershipRow>(e => { e.ToTable("memberships", "organizations"); e.HasKey(x => new { x.CustomerId, x.UserId }); e.Property(x => x.Role).HasMaxLength(16); e.HasOne<CustomerRow>().WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Cascade); e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict); });
        model.Entity<CustomerInviteRow>(e => { e.ToTable("invitations", "organizations"); e.HasKey(x => x.Id); e.Property(x => x.Email).HasMaxLength(256); e.Property(x => x.Role).HasMaxLength(16); e.HasIndex(x => new { x.CustomerId, x.Email }).IsUnique(); e.HasOne<CustomerRow>().WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Cascade); });
        model.Entity<SubscriptionRow>(e => { e.ToTable("subscriptions", "billing"); e.HasKey(x => x.CustomerId); e.Property(x => x.PlanId).HasMaxLength(64); e.HasIndex(x => x.NextCheckAt); });
        model.Entity<PaymentOrderRow>(e => { e.ToTable("orders", "billing"); e.HasKey(x => x.Id); e.Property(x => x.PlanId).HasMaxLength(64); e.Property(x => x.Provider).HasMaxLength(16); e.Property(x => x.Interval).HasMaxLength(8); e.Property(x => x.Currency).HasMaxLength(3); e.HasIndex(x => x.CustomerId); });
        model.Entity<PaymentReceiptRow>(e => { e.ToTable("receipts", "billing"); e.HasKey(x => new { x.Provider, x.Id }); e.Property(x => x.Provider).HasMaxLength(16); e.Property(x => x.Id).HasMaxLength(128); e.HasOne<PaymentOrderRow>().WithMany().HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Restrict); });
        model.Entity<BillingSettingsRow>(e => { e.ToTable("settings", "billing", t => t.HasCheckConstraint("CK_billing_singleton", "\"Id\" = 1")); e.HasKey(x => x.Id); e.Property(x => x.Version).IsConcurrencyToken(); e.HasData(new BillingSettingsRow { Version = new Guid("701d0245-9cc1-4028-a909-380f43739f13") }); });
    }
}
