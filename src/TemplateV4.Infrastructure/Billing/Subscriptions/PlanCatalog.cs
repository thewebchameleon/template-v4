using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Billing;
using TemplateV4.Domain.Customers;

namespace TemplateV4.Infrastructure.Billing;

public sealed class PlanCatalog
{
    public BillingPlan[] Plans { get; }
    public PlanCatalog(IConfiguration config)
    {
        Plans = config.GetSection("Billing:Plans").Get<BillingPlan[]>() ??
        [new("free", "Free", "Flat", "ZAR", 0, 0, 100L * 1024 * 1024), new("standard", "Standard (demo)", "Flat", "ZAR", 9900, 99000, 10L * 1024 * 1024 * 1024), new("team", "Team (demo)", "PerSeat", "ZAR", 4900, 49000, 50L * 1024 * 1024 * 1024)];
        if (Plans.Length is < 2 or > 20 || Plans.Count(x => x.Id == "free" && x.MonthlyMinor == 0 && x.YearlyMinor == 0 && x.Pricing == "Flat") != 1 || Plans.Select(x => x.Id).Distinct().Count() != Plans.Length ||
            Plans.Any(x => string.IsNullOrWhiteSpace(x.Id) || x.Id.Length > 64 || !x.Id.All(c => char.IsAsciiLetterOrDigit(c) || c == '-') || !CustomerRules.ValidName(x.Name) || x.Pricing is not ("Flat" or "PerSeat") || x.Currency is not ("ZAR" or "USD" or "EUR" or "GBP") || x.StorageBytes is < 0 or > 10995116277760 || x.Id != "free" && (x.MonthlyMinor is < 500 or > 100000000 || x.YearlyMinor is < 500 or > 100000000))) throw new InvalidOperationException("Invalid Billing:Plans catalog.");
    }
    public BillingPlan Free => Plans.Single(x => x.Id == "free");
}
