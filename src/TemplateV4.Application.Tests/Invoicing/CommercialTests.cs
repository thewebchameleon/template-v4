using TemplateV4.Application.Invoicing;
using TemplateV4.Domain.Invoicing;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class CommercialRulesTests
{
    [Fact]
    public void Tax_rounds_each_line_away_from_zero_and_preserves_explicit_tax_treatment()
    {
        var totals = CommercialRules.Price([
            new("Government charge", ChargeCategory.Government, 1, 100m, TaxTreatment.OutsideScope, 0),
            new("Service", ChargeCategory.ServiceFee, 1, 0.10m, TaxTreatment.Standard, 15),
            new("Extra", ChargeCategory.Extra, 1, 0.10m, TaxTreatment.Standard, 15)]);
        Assert.Equal(100.20m, totals.Net); Assert.Equal(0.04m, totals.Tax); Assert.Equal(100.24m, totals.Total);
        Assert.Throws<ArgumentException>(() => CommercialRules.Price([new("Invalid", ChargeCategory.Extra, 1, 1, TaxTreatment.Exempt, 15)]));
        Assert.False(CommercialRules.CanSettle(100, 20, 0, 40));
        Assert.True(CommercialRules.CanSettle(100, 20, 0, 80));
        Assert.False(CommercialRules.CanSettle(100, 0, 100, 100));
        Assert.False(CommercialRules.CanRefund(100, 0, 100, 0, 1));
        Assert.True(CommercialRules.CanRefund(100, 30, 100, 10, 20));
        Assert.False(CommercialRules.CanRefund(100, 30, 100, 10, 20.01m));
    }
}
