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
            e.Property(x => x.Country).HasMaxLength(2);
            e.Property(x => x.PrimaryContactNumber).HasMaxLength(16);
            e.Property(x => x.Version).IsConcurrencyToken();
            e.HasOne<OrganisationLogoRow>().WithMany().HasForeignKey(x => x.LogoId).OnDelete(DeleteBehavior.Restrict);
            e.HasData(new CustomerRow { Id = TemplateV4.Application.Customers.Organisation.Id, Name = "Organisation", TimeZone = "Africa/Johannesburg", Country = "ZA", Version = new Guid("d473876e-a68f-4d80-8c97-ccdddcddbcdb") });
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
    }
}
